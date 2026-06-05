"use server";
import { db } from "@/lib/db";
import { users, teams, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function ensureTestUser(role: "player" | "coach" | "admin") {
  const email = `${role}@example.com`;
  const password = "password123";

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) return { success: true };

  const hashedPassword = await bcrypt.hash(password, 10);

  let teamId: string | undefined;

  if (role !== "admin") {
    // Ensure we have a team for player/coach
    let demoTeam = await db.query.teams.findFirst({
      where: eq(teams.name, "Demo Team"),
    });

    if (!demoTeam) {
      let org = await db.query.organizations.findFirst();
      if (!org) {
        [org] = await db.insert(organizations).values({
          name: "Demo Org",
        }).returning();
      }

      [demoTeam] = await db.insert(teams).values({
        name: "Demo Team",
        orgId: org.id,
        inviteCode: "DEMO1",
        coachInviteCode: "COACH1",
        playerInviteCode: "PLAYER1",
      }).returning();
    }
    teamId = demoTeam.id;
  }

  await db.insert(users).values({
    email,
    password: hashedPassword,
    name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    role,
    teamId,
  });

  return { success: true };
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as "player" | "coach" | "admin" || "player";
  const adminCode = formData.get("adminCode") as string;

  if (role === "admin") {
    const validAdminCode = process.env.ADMIN_SIGNUP_CODE;
    if (!validAdminCode || adminCode !== validAdminCode) {
      throw new Error("Invalid admin access code");
    }
  }

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role,
  });

  return { success: true };
}
