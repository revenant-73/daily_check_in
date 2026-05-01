"use server";

import { db } from "@/lib/db";
import { teams, users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getTeams() {
  return await db.select().from(teams);
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

export async function joinTeam(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).get();
  // Only set role to player if they don't already have one, or preserve higher roles
  const newRole = (user?.role === "admin" || user?.role === "coach") ? user.role : "player";

  await db.update(users)
    .set({ teamId, role: newRole })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { success: true };
}

export async function joinTeamByCode(inviteCode: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const normalizedCode = inviteCode.toUpperCase();

  const team = await db.query.teams.findFirst({
    where: or(
      eq(teams.coachInviteCode, normalizedCode),
      eq(teams.playerInviteCode, normalizedCode)
    ),
  });

  if (!team) {
    throw new Error("Invalid invite code");
  }

  const role = team.coachInviteCode === normalizedCode ? "coach" : "player";

  await db.update(users)
    .set({ 
      teamId: team.id,
      role: role
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { success: true };
}

export async function createTeam(name: string, orgId: string) {
  console.log("[createTeam] Starting creation process:", { name, orgId });
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error("[createTeam] Unauthorized: No session or user ID");
      throw new Error("Unauthorized");
    }

    console.log("[createTeam] User authenticated:", session.user.id);

    const coachInviteCode = await generateUniqueInviteCode();
    const playerInviteCode = await generateUniqueInviteCode();
    
    console.log("[createTeam] Generated codes:", { coachInviteCode, playerInviteCode });

    const [newTeam] = await db.insert(teams).values({
      name,
      orgId,
      inviteCode: playerInviteCode, // Populate legacy field
      coachInviteCode,
      playerInviteCode,
    }).returning();

    if (!newTeam) {
      console.error("[createTeam] Failed to create team record - no team returned");
      throw new Error("Failed to create team record");
    }

    console.log("[createTeam] Team created successfully:", newTeam.id);

    // Automatically assign creator as coach IF they are not already an admin
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).get();
    
    if (user && user.role !== "admin") {
      console.log("[createTeam] Assigning creator as coach...");
      await db.update(users)
        .set({ 
          teamId: newTeam.id, 
          role: "coach" 
        })
        .where(eq(users.id, session.user.id));
      console.log("[createTeam] Role updated to coach");
    } else {
      console.log("[createTeam] Skipping role update (User is admin or not found)");
    }
    
    revalidatePath("/onboarding");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    console.log("[createTeam] Paths revalidated");
  } catch (error) {
    console.error("[createTeam] CRITICAL ERROR:", error);
    throw error;
  }
}
