"use server";

import { db } from "@/lib/db";
import { teams, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

  await db.update(users)
    .set({ teamId })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { success: true };
}

export async function joinTeamByCode(inviteCode: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const team = await db.query.teams.findFirst({
    where: eq(teams.inviteCode, inviteCode.toUpperCase()),
  });

  if (!team) {
    throw new Error("Invalid invite code");
  }

  await db.update(users)
    .set({ teamId: team.id })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { success: true };
}

export async function createTeam(name: string, orgId: string) {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  await db.insert(teams).values({
    name,
    orgId,
    inviteCode,
  });
  revalidatePath("/onboarding");
}
