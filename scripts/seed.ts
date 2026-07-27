import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // 1. Create a Demo Organization
  let org = await db.query.organizations.findFirst({
    where: eq(schema.organizations.name, "Demo Organization")
  });
  
  if (!org) {
    [org] = await db.insert(schema.organizations).values({
      name: "Demo Organization",
    }).returning();
  }

  // 2. Create a Demo Team
  let team = await db.query.teams.findFirst({
    where: eq(schema.teams.inviteCode, "DEMO1")
  });

  if (!team) {
    [team] = await db.insert(schema.teams).values({
      name: "Demo Varsity",
      orgId: org.id,
      inviteCode: "DEMO1",
      coachInviteCode: "COACH1",
      playerInviteCode: "PLAYER1",
    }).returning();
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Demo Users
  const userEmails = [
    "admin@example.com",
    "coach@example.com",
    "player@example.com",
    "athlete2@example.com"
  ];

  const existingUsers = await db.query.users.findMany({
    where: (users, { inArray }) => inArray(users.email, userEmails)
  });

  const existingEmails = new Set(existingUsers.map(u => u.email));
  const newUsers = [];

  if (!existingEmails.has("admin@example.com")) {
    newUsers.push({
      email: "admin@example.com",
      password: hashedPassword,
      name: "Demo Admin",
      role: "admin" as const,
    });
  }

  if (!existingEmails.has("coach@example.com")) {
    newUsers.push({
      email: "coach@example.com",
      password: hashedPassword,
      name: "Demo Coach",
      role: "coach" as const,
      teamId: team.id,
    });
  }

  if (!existingEmails.has("player@example.com")) {
    newUsers.push({
      email: "player@example.com",
      password: hashedPassword,
      name: "Demo Player",
      role: "player" as const,
      teamId: team.id,
    });
  }

  if (!existingEmails.has("athlete2@example.com")) {
    newUsers.push({
      email: "athlete2@example.com",
      password: hashedPassword,
      name: "Alex Smith",
      role: "player" as const,
      teamId: team.id,
    });
  }

  let seededUsers = [...existingUsers];
  if (newUsers.length > 0) {
    const created = await db.insert(schema.users).values(newUsers).returning();
    seededUsers = [...seededUsers, ...created];
  }

  const p1 = seededUsers.find(u => u.email === "player@example.com")!;
  const p2 = seededUsers.find(u => u.email === "athlete2@example.com")!;

  // 4. Create some Check-ins for today
  await db.insert(schema.checkIns).values([
    {
      playerId: p1.id,
      teamId: team.id,
      goal: "Master my jump serve",
      mentalRating: 8,
      physicalRating: 7,
      emotionalRating: 9,
    },
    {
      playerId: p2.id,
      teamId: team.id,
      goal: "Focus on defensive positioning",
      mentalRating: 3, // This should trigger the alert!
      physicalRating: 4,
      emotionalRating: 5,
    }
  ]);

  console.log("Database seeded successfully with check-ins!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
