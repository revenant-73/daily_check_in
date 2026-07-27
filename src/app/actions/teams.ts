"use server";

import { randomBytes } from "node:crypto";

import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { teams, users } from "@/lib/db/schema";

const inviteCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{6}$/, "Enter a valid 6-character invite code");

const createTeamSchema = z.object({
  name: z.string().trim().min(2, "Team name is required").max(100),
  orgId: z.string().uuid("Invalid organization"),
});

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function generateUniqueInviteCode() {
  for (let attempts = 0; attempts < 10; attempts++) {
    const bytes = randomBytes(6);
    const code = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
    const existing = await db.query.teams.findFirst({
      where: or(
        eq(teams.inviteCode, code),
        eq(teams.coachInviteCode, code),
        eq(teams.playerInviteCode, code)
      ),
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Unable to generate a unique invite code");
}

export async function joinTeamByCode(inviteCode: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsedCode = inviteCodeSchema.safeParse(inviteCode);
  if (!parsedCode.success) {
    throw new Error(parsedCode.error.issues[0]?.message ?? "Invalid invite code");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    throw new Error("Account not found");
  }
  if (user.role === "admin") {
    throw new Error("Administrator accounts cannot join teams with an invite code");
  }
  if (user.teamId) {
    throw new Error("Your account is already assigned to a team");
  }

  const team = await db.query.teams.findFirst({
    where: or(
      eq(teams.coachInviteCode, parsedCode.data),
      eq(teams.playerInviteCode, parsedCode.data)
    ),
  });

  if (!team) {
    throw new Error("Invalid invite code");
  }

  const role = team.coachInviteCode === parsedCode.data ? "coach" : "player";

  await db
    .update(users)
    .set({ teamId: team.id, role })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { success: true };
}

export async function createTeam(name: string, orgId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (user?.role !== "admin") {
    throw new Error("Administrator access required");
  }

  const parsed = createTeamSchema.safeParse({ name, orgId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid team details");
  }

  const coachInviteCode = await generateUniqueInviteCode();
  const playerInviteCode = await generateUniqueInviteCode();

  const [newTeam] = await db
    .insert(teams)
    .values({
      name: parsed.data.name,
      orgId: parsed.data.orgId,
      inviteCode: playerInviteCode,
      coachInviteCode,
      playerInviteCode,
    })
    .returning();

  if (!newTeam) {
    throw new Error("Failed to create team");
  }

  revalidatePath("/admin", "layout");
  return { success: true, teamId: newTeam.id };
}
