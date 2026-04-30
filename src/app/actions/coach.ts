"use server";

import { db } from "@/lib/db";
import { checkIns, reviews, users, teams } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function getTeamData() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "coach") {
    throw new Error("Unauthorized");
  }

  const coach = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!coach?.teamId) {
    return null;
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, coach.teamId),
  });

  const teamPlayers = await db.query.users.findMany({
    where: eq(users.teamId, coach.teamId),
  });

  if (teamPlayers.length === 0) {
    return {
      team,
      players: [],
      checkIns: [],
      reviews: [],
    };
  }

  const playerIds = teamPlayers.map(p => p.id);

  const allCheckIns = await db.query.checkIns.findMany({
    where: (checkIns, { inArray }) => inArray(checkIns.playerId, playerIds),
    orderBy: [desc(checkIns.createdAt)],
  });

  const allReviews = await db.query.reviews.findMany({
    where: (reviews, { inArray }) => inArray(reviews.playerId, playerIds),
    orderBy: [desc(reviews.createdAt)],
  });

  // Calculate today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const playersWithStatus = teamPlayers.map(player => {
    const hasCheckedInToday = allCheckIns.some(ci => 
      ci.playerId === player.id && 
      ci.createdAt && 
      new Date(ci.createdAt) >= today
    );
    return {
      ...player,
      hasCheckedInToday
    };
  });

  return {
    team,
    players: playersWithStatus,
    checkIns: allCheckIns,
    reviews: allReviews,
  };
}

export async function getTeamReadinessTrends() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "coach") {
    throw new Error("Unauthorized");
  }

  const coach = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!coach?.teamId) return [];

  const teamPlayers = await db.query.users.findMany({
    where: eq(users.teamId, coach.teamId),
  });
  
  if (teamPlayers.length === 0) return [];

  const playerIds = teamPlayers.map(p => p.id);

  const checkInsData = await db.query.checkIns.findMany({
    where: (checkIns, { inArray }) => inArray(checkIns.playerId, playerIds),
    orderBy: [desc(checkIns.createdAt)],
  });

  // Group by date and calculate average
  const trends: Record<string, { total: number, count: number }> = {};
  
  checkInsData.forEach(ci => {
    const date = ci.createdAt ? new Date(ci.createdAt).toLocaleDateString() : "unknown";
    const avg = (ci.mentalRating + ci.physicalRating + ci.emotionalRating) / 3;
    if (!trends[date]) {
      trends[date] = { total: 0, count: 0 };
    }
    trends[date].total += avg;
    trends[date].count += 1;
  });

  return Object.entries(trends).map(([date, data]) => ({
    date,
    average: data.total / data.count,
  })).slice(0, 7).reverse();
}

export async function getPlayerData(playerId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "coach") {
    throw new Error("Unauthorized");
  }

  const coach = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  const player = await db.query.users.findFirst({
    where: eq(users.id, playerId),
  });

  if (!coach?.teamId || !player || player.teamId !== coach.teamId) {
    throw new Error("Unauthorized or Player not found");
  }

  const playerCheckIns = await db.query.checkIns.findMany({
    where: eq(checkIns.playerId, playerId),
    orderBy: [desc(checkIns.createdAt)],
    limit: 10,
  });

  const playerReviews = await db.query.reviews.findMany({
    where: eq(reviews.playerId, playerId),
    orderBy: [desc(reviews.createdAt)],
    limit: 10,
  });

  const trends = playerCheckIns.map(ci => ({
    date: ci.createdAt,
    mental: ci.mentalRating,
    physical: ci.physicalRating,
    emotional: ci.emotionalRating,
    average: (ci.mentalRating + ci.physicalRating + ci.emotionalRating) / 3
  })).reverse();

  return {
    player,
    checkIns: playerCheckIns,
    reviews: playerReviews,
    trends,
  };
}
