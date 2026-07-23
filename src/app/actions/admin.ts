"use server";

import { db } from "@/lib/db";
import { organizations, teams, users, checkIns, reviews, reactions } from "@/lib/db/schema";
import { eq, desc, inArray, or } from "drizzle-orm";
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

    const teamsWithStats = await Promise.all(allTeams.map(async (team: typeof teams.$inferSelect) => {
      const teamPlayers = allUsers.filter((u: typeof users.$inferSelect) => u.teamId === team.id);
      if (teamPlayers.length === 0) {
        return {
          ...team,
          avgReadiness: 0,
          avgPerformance: 0,
          playerCount: 0
        };
      }

      const playerIds = teamPlayers.map((p: typeof users.$inferSelect) => p.id);
      
      const teamCheckIns = await db.select().from(checkIns).where(inArray(checkIns.playerId, playerIds));
      const teamReviews = await db.select().from(reviews).where(inArray(reviews.playerId, playerIds));

      const avgReadiness = teamCheckIns.length > 0
        ? teamCheckIns.reduce((acc, ci) => acc + (ci.mentalRating + ci.physicalRating + ci.emotionalRating) / 3, 0) / teamCheckIns.length
        : 0;

      const avgPerformance = teamReviews.length > 0
        ? teamReviews.reduce((acc, r) => acc + r.rating, 0) / teamReviews.length
        : 0;

      const lastCheckIn = teamCheckIns.length > 0 ? teamCheckIns[0].createdAt : null;

      return {
        ...team,
        avgReadiness,
        avgPerformance,
        playerCount: teamPlayers.length,
        lastActivity: lastCheckIn
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
    allCheckIns.forEach((ci: typeof checkIns.$inferSelect) => {
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

    const playersWithStatus = teamPlayers.map((player: typeof users.$inferSelect) => {
      const hasCheckedInToday = allCheckIns.some((ci: typeof checkIns.$inferSelect) => 
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

async function generateUniqueInviteCode() {
  let code = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await db.query.teams.findFirst({
      where: or(
        eq(teams.inviteCode, code),
        eq(teams.coachInviteCode, code),
        eq(teams.playerInviteCode, code)
      ),
    });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  return code;
}

export async function adminCreateTeam(name: string, orgId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  const coachInviteCode = await generateUniqueInviteCode();
  const playerInviteCode = await generateUniqueInviteCode();

  await db.insert(teams).values({
    name,
    orgId,
    inviteCode: playerInviteCode,
    coachInviteCode,
    playerInviteCode,
  });

  revalidatePath("/admin", "layout");
  revalidatePath(`/admin/org/${orgId}`, "layout");
}

export async function createOrganization(name: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.insert(organizations).values({ name });
  revalidatePath("/admin", "layout");
}

export async function deleteOrganization(orgId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.delete(organizations).where(eq(organizations.id, orgId));
  revalidatePath("/admin", "layout");
}

export async function deleteTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  try {
    // 1. Delete all reactions for check-ins in this team
    const teamCheckIns = await db.select().from(checkIns).where(eq(checkIns.teamId, teamId));
    if (teamCheckIns.length > 0) {
      const checkInIds = teamCheckIns.map((ci: typeof checkIns.$inferSelect) => ci.id);
      await db.delete(reactions).where(inArray(reactions.checkInId, checkInIds));
    }

    // 2. Delete all check-ins for this team
    await db.delete(checkIns).where(eq(checkIns.teamId, teamId));

    // 3. Delete all reviews for this team
    await db.delete(reviews).where(eq(reviews.teamId, teamId));

    // 4. Unassign users from this team
    await db.update(users).set({ teamId: null }).where(eq(users.teamId, teamId));

    // 5. Finally delete the team
    await db.delete(teams).where(eq(teams.id, teamId));

    revalidatePath("/admin", "layout");
  } catch (error) {
    logError("deleteTeam", error);
    throw new Error("Failed to delete team and its related data");
  }
}

export async function updateUserRole(userId: string, role: "admin" | "coach" | "player") {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin", "layout");
}

export async function assignToTeam(userId: string, teamId: string | null) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ teamId }).where(eq(users.id, userId));
  revalidatePath("/admin", "layout");
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin", "layout");
}

export async function batchCreateUsers(teamId: string, roster: { name: string, email: string }[]) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

    const newUsers = roster.map(u => ({
      name: u.name,
      email: u.email.toLowerCase().trim(),
      role: "player" as const,
      teamId,
    }));

    // In a real app we'd handle existing users or send invites
    // For now we just insert
    for (const user of newUsers) {
      const existing = await db.select().from(users).where(eq(users.email, user.email)).get();
      if (!existing) {
        await db.insert(users).values(user);
      } else {
        // Just update team if already exists?
        await db.update(users).set({ teamId }).where(eq(users.id, existing.id));
      }
    }

    revalidatePath("/admin", "layout");
    revalidatePath(`/admin/team/${teamId}`, "layout");
  } catch (error) {
    logError("batchCreateUsers", error);
    throw error;
  }
}
