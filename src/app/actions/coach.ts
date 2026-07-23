"use server";

import { db } from "@/lib/db";
import { checkIns, reviews, users, teams, reactions } from "@/lib/db/schema";
import { eq, desc, inArray, sql, and } from "drizzle-orm";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function addReaction(checkInId: string, type: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "coach") {
      throw new Error("Unauthorized");
    }

    // Check if already reacted with same type
    const existing = await db.select().from(reactions).where(
      and(
        eq(reactions.checkInId, checkInId),
        eq(reactions.coachId, session.user.id),
        eq(reactions.type, type)
      )
    ).get();

    if (existing) {
      // Remove reaction if already exists (toggle)
      await db.delete(reactions).where(eq(reactions.id, existing.id));
    } else {
      await db.insert(reactions).values({
        checkInId,
        coachId: session.user.id,
        type,
      });
    }

    revalidatePath("/coach/dashboard");
  } catch (error) {
    logError("addReaction", error);
    throw error;
  }
}

export async function submitCoachNote(checkInId: string, note: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "coach") {
      throw new Error("Unauthorized");
    }

    const checkIn = await db.select().from(checkIns).where(eq(checkIns.id, checkInId)).get();
    if (!checkIn) throw new Error("Check-in not found");

    const metadata = checkIn.metadata ? JSON.parse(checkIn.metadata) : {};
    metadata.coachNote = note;
    metadata.coachId = session.user.id;
    metadata.coachNoteAt = new Date().toISOString();

    await db.update(checkIns)
      .set({ metadata: JSON.stringify(metadata) })
      .where(eq(checkIns.id, checkInId));

    revalidatePath("/coach/dashboard");
    revalidatePath("/dashboard"); // For player
  } catch (error) {
    logError("submitCoachNote", error);
    throw error;
  }
}

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

    const teamPlayers = await db.select().from(users).where(eq(users.teamId, coach.teamId)).all();

    if (teamPlayers.length === 0) {
      return {
        team,
        players: [],
        checkIns: [],
        reviews: [],
      };
    }

    const playerIds = teamPlayers.map((p: typeof users.$inferSelect) => p.id);

    const allCheckIns = await db.select().from(checkIns).where(inArray(checkIns.playerId, playerIds)).orderBy(desc(checkIns.createdAt)).all();

    const allReactions = await db.select().from(reactions).where(inArray(reactions.checkInId, allCheckIns.map((ci: typeof checkIns.$inferSelect) => ci.id))).all();

    const allReviews = await db.select().from(reviews).where(inArray(reviews.playerId, playerIds)).orderBy(desc(reviews.createdAt)).all();

    // Calculate today's attendance (last 24 hours to be safe with timezones)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const playersWithStatus = teamPlayers.map((player: typeof users.$inferSelect) => {
      const playerCheckIns = allCheckIns.filter((ci: typeof checkIns.$inferSelect) => ci.playerId === player.id);
      const latestCheckIn = playerCheckIns[0];
      const hasCheckedInToday = latestCheckIn && latestCheckIn.createdAt && new Date(latestCheckIn.createdAt) >= twentyFourHoursAgo;
      
      const latestReadiness = latestCheckIn ? (latestCheckIn.mentalRating + latestCheckIn.physicalRating + latestCheckIn.emotionalRating) / 3 : null;

      return {
        ...player,
        hasCheckedInToday,
        latestReadiness
      };
    });

    // Calculate previous averages (last 7 days excluding last 24h) for Delta
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    const prevCheckIns = allCheckIns.filter(ci => 
      ci.createdAt && 
      new Date(ci.createdAt) >= eightDaysAgo && 
      new Date(ci.createdAt) < twentyFourHoursAgo
    );

    const prevAvg = prevCheckIns.length > 0 ? {
      mental: prevCheckIns.reduce((acc: number, ci: typeof checkIns.$inferSelect) => acc + ci.mentalRating, 0) / prevCheckIns.length,
      physical: prevCheckIns.reduce((acc: number, ci: typeof checkIns.$inferSelect) => acc + ci.physicalRating, 0) / prevCheckIns.length,
      emotional: prevCheckIns.reduce((acc: number, ci: typeof checkIns.$inferSelect) => acc + ci.emotionalRating, 0) / prevCheckIns.length,
    } : null;

    // Calculate Alarming Trends (3-4 day decline or low)
    const criticalPlayers = teamPlayers.map((player: typeof users.$inferSelect) => {
      const playerCheckIns = allCheckIns
        .filter((ci: typeof checkIns.$inferSelect) => ci.playerId === player.id)
        .slice(0, 4); // Last 4 check-ins

      if (playerCheckIns.length < 2) return null;

      const scores = playerCheckIns.map(ci => (ci.mentalRating + ci.physicalRating + ci.emotionalRating) / 3);
      const currentAvg = scores[0];
      const prevAvg = scores.slice(1).reduce((a, b) => a + b, 0) / (scores.length - 1);
      
      const isDeclining = currentAvg < prevAvg - 1.5; // Significant drop
      const isLow = currentAvg <= 4; // Flat out low

      if (isDeclining || isLow) {
        return {
          id: player.id,
          name: player.name,
          currentScore: currentAvg,
          prevScore: prevAvg,
          status: isLow ? 'LOW' : 'DECLINING'
        };
      }
      return null;
    }).filter(Boolean);

    return {
      team,
      players: playersWithStatus,
      checkIns: allCheckIns.filter(ci => ci.createdAt && new Date(ci.createdAt) >= twentyFourHoursAgo),
      allCheckIns,
      reviews: allReviews,
      reactions: allReactions,
      prevAvg,
      criticalPlayers
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

    const teamPlayers = await db.select().from(users).where(eq(users.teamId, coach.teamId)).all();
    
    if (teamPlayers.length === 0) return [];

    const playerIds = teamPlayers.map((p: typeof users.$inferSelect) => p.id);

    const checkInsData = await db.select().from(checkIns).where(inArray(checkIns.playerId, playerIds)).orderBy(desc(checkIns.createdAt)).all();

    // Group by date and calculate average
    const trends: Record<string, { total: number, count: number }> = {};
    
    checkInsData.forEach((ci: typeof checkIns.$inferSelect) => {
      if (!ci.createdAt) return;
      const date = new Date(ci.createdAt).toLocaleDateString();
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
  if (!session?.user?.id || (session.user.role !== "coach" && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).get();
  const player = await db.select().from(users).where(eq(users.id, playerId)).get();

  if (!player) {
    throw new Error("Player not found");
  }

  // If coach, verify player is in their team
  if (session.user.role === "coach") {
    if (!user?.teamId || player.teamId !== user.teamId) {
      throw new Error("Unauthorized");
    }
  }

  const playerCheckIns = await db.select().from(checkIns).where(eq(checkIns.playerId, playerId)).orderBy(desc(checkIns.createdAt)).limit(10).all();

  const playerReviews = await db.select().from(reviews).where(eq(reviews.playerId, playerId)).orderBy(desc(reviews.createdAt)).limit(10).all();

  const trends = playerCheckIns.map((ci: typeof checkIns.$inferSelect) => ({
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
