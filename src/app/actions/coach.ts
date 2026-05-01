"use server";

import { db } from "@/lib/db";
import { checkIns, reviews, users, teams } from "@/lib/db/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

export async function getTeamData() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "coach") {
      throw new Error("Unauthorized");
    }

    const coach = await db.select().from(users).where(eq(users.id, session.user.id)).get();

    if (!coach?.teamId) {
      return null;
    }

    const team = await db.select().from(teams).where(eq(teams.id, coach.teamId)).get();

    const teamPlayers = await db.select().from(users).where(eq(users.teamId, coach.teamId));

    if (teamPlayers.length === 0) {
      return {
        team,
        players: [],
        checkIns: [],
        reviews: [],
      };
    }

    const playerIds = teamPlayers.map(p => p.id);

    const allCheckIns = await db.select().from(checkIns).where(inArray(checkIns.playerId, playerIds)).orderBy(desc(checkIns.createdAt));

    const allReviews = await db.select().from(reviews).where(inArray(reviews.playerId, playerIds)).orderBy(desc(reviews.createdAt));

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
  } catch (error) {
    logError("getTeamData", error);
    throw error;
  }
}

export async function getTeamReadinessTrends() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "coach") {
      throw new Error("Unauthorized");
    }

    const coach = await db.select().from(users).where(eq(users.id, session.user.id)).get();

    if (!coach?.teamId) return [];

    const teamPlayers = await db.select().from(users).where(eq(users.teamId, coach.teamId));
    
    if (teamPlayers.length === 0) return [];

    const playerIds = teamPlayers.map(p => p.id);

    const checkInsData = await db.select().from(checkIns).where(inArray(checkIns.playerId, playerIds)).orderBy(desc(checkIns.createdAt));

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
  } catch (error) {
    logError("getTeamReadinessTrends", error);
    throw error;
  }
}

export async function getPlayerData(playerId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "coach") {
    throw new Error("Unauthorized");
  }

  const coach = await db.select().from(users).where(eq(users.id, session.user.id)).get();

  const player = await db.select().from(users).where(eq(users.id, playerId)).get();

  if (!coach?.teamId || !player || player.teamId !== coach.teamId) {
    throw new Error("Unauthorized or Player not found");
  }

  const playerCheckIns = await db.select().from(checkIns).where(eq(checkIns.playerId, playerId)).orderBy(desc(checkIns.createdAt)).limit(10);

  const playerReviews = await db.select().from(reviews).where(eq(reviews.playerId, playerId)).orderBy(desc(reviews.createdAt)).limit(10);

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
