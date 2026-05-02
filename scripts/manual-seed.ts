import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
  console.log("Starting manual seed...");

  // 1. Get or Create Org
  let org = await db.query.organizations.findFirst({
    where: eq(schema.organizations.name, "Demo Organization")
  });

  if (!org) {
    console.log("Creating organization...");
    [org] = await db.insert(schema.organizations).values({
      name: "Demo Organization",
    }).returning();
  }

  // 2. Get or Create Team
  let team = await db.query.teams.findFirst({
    where: eq(schema.teams.name, "Demo Varsity")
  });

  if (!team) {
    console.log("Creating team...");
    [team] = await db.insert(schema.teams).values({
      name: "Demo Varsity",
      orgId: org!.id,
      inviteCode: "DEMO1",
      coachInviteCode: "COACH1",
      playerInviteCode: "PLAYER1",
    }).returning();
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Users if they don't exist
  const demoUsers = [
    { email: "admin@example.com", name: "Demo Admin", role: "admin" as const },
    { email: "coach@example.com", name: "Demo Coach", role: "coach" as const, teamId: team!.id },
    { email: "player@example.com", name: "Demo Player", role: "player" as const, teamId: team!.id },
    { email: "athlete2@example.com", name: "Alex Smith", role: "player" as const, teamId: team!.id },
  ];

  const players: any[] = [];

  for (const userData of demoUsers) {
    let user = await db.query.users.findFirst({
      where: eq(schema.users.email, userData.email)
    });

    if (!user) {
      console.log(`Creating user ${userData.email}...`);
      [user] = await db.insert(schema.users).values({
        ...userData,
        password: hashedPassword,
      }).returning();
    }
    
    if (userData.role === "player") {
      players.push(user);
    }
  }

  // 4. Create fresh Check-ins for today
  console.log("Creating fresh check-ins...");
  await db.insert(schema.checkIns).values([
    {
      playerId: players[0].id,
      teamId: team!.id,
      goal: "Master my jump serve",
      mentalRating: 8,
      physicalRating: 7,
      emotionalRating: 9,
    },
    {
      playerId: players[1].id,
      teamId: team!.id,
      goal: "Focus on defensive positioning",
      mentalRating: 3,
      physicalRating: 4,
      emotionalRating: 5,
    }
  ]);

  console.log("Manual seed completed successfully!");
}

seed().catch(console.error);
