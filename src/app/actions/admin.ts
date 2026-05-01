"use server";

import { db } from "@/lib/db";
import { organizations, teams, users, checkIns, reviews } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";

export async function getAdminData() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const allOrganizations = await db.select().from(organizations);
    const allTeams = await db.select().from(teams);
    const allUsers = await db.select().from(users);

    const teamsWithStats = await Promise.all(allTeams.map(async (team) => {
      const teamPlayers = allUsers.filter(u => u.teamId === team.id);
      if (teamPlayers.length === 0) {
        return {
          ...team,
          avgReadiness: 0,
          avgPerformance: 0,
          playerCount: 0
        };
      }

      const playerIds = teamPlayers.map(p => p.id);
      
      const teamCheckIns = await db.select().from(checkIns).where(inArray(checkIns.playerId, playerIds));
      const teamReviews = await db.select().from(reviews).where(inArray(reviews.playerId, playerIds));

      const avgReadiness = teamCheckIns.length > 0
        ? teamCheckIns.reduce((acc, ci) => acc + (ci.mentalRating + ci.physicalRating + ci.emotionalRating) / 3, 0) / teamCheckIns.length
        : 0;

      const avgPerformance = teamReviews.length > 0
        ? teamReviews.reduce((acc, r) => acc + r.rating, 0) / teamReviews.length
        : 0;

      return {
        ...team,
        avgReadiness,
        avgPerformance,
        playerCount: teamPlayers.length
      };
    }));

    return {
      organizations: allOrganizations,
      teams: teamsWithStats,
      users: allUsers,
    };
  } catch (error) {
    logError("getAdminData", error);
    throw error;
  }
}

export async function getTeamDataForAdmin(teamId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const team = await db.select().from(teams).where(eq(teams.id, teamId)).get();
    if (!team) return null;

    const teamPlayers = await db.select().from(users).where(eq(users.teamId, teamId));

    if (teamPlayers.length === 0) {
      return {
        team,
        players: [],
        checkIns: [],
        reviews: [],
        trends: []
      };
    }

    const playerIds = teamPlayers.map(p => p.id);

    const allCheckIns = await db.select().from(checkIns).where(inArray(checkIns.playerId, playerIds)).orderBy(desc(checkIns.createdAt));
    const allReviews = await db.select().from(reviews).where(inArray(reviews.playerId, playerIds)).orderBy(desc(reviews.createdAt));

    // Calculate trends
    const trendMap: Record<string, { total: number, count: number }> = {};
    allCheckIns.forEach(ci => {
      if (!ci.createdAt) return;
      const date = new Date(ci.createdAt).toLocaleDateString();
      const avg = (ci.mentalRating + ci.physicalRating + ci.emotionalRating) / 3;
      if (!trendMap[date]) {
        trendMap[date] = { total: 0, count: 0 };
      }
      trendMap[date].total += avg;
      trendMap[date].count += 1;
    });

    const trends = Object.entries(trendMap).map(([date, data]) => ({
      date,
      average: data.total / data.count,
    })).slice(0, 7).reverse();

    // Calculate today's status
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
      trends
    };
  } catch (error) {
    logError("getTeamDataForAdmin", error);
    throw error;
  }
}

export async function createOrganization(name: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.insert(organizations).values({ name });
  revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: "admin" | "coach" | "player") {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin");
}

export async function assignToTeam(userId: string, teamId: string | null) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ teamId }).where(eq(users.id, userId));
  revalidatePath("/admin");
}
