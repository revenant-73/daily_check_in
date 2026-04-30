"use server";

import { db } from "@/lib/db";
import { teams, users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getTeams() {
  return await db.select().from(teams);
}

export async function joinTeam(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // When selecting a team manually from the list, default to player role
  // if they don't already have a higher role
  await db.update(users)
    .set({ teamId, role: "player" })
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
  const coachInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const playerInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  await db.insert(teams).values({
    name,
    orgId,
    coachInviteCode,
    playerInviteCode,
  });
  
  revalidatePath("/onboarding");
  revalidatePath("/admin");
}
