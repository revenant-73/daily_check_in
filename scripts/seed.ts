import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // 1. Create a Demo Organization
  const [org] = await db.insert(schema.organizations).values({
    name: "Demo Organization",
  })
  .onConflictDoUpdate({
    target: schema.organizations.name,
    set: { name: "Demo Organization" }
  })
  .returning();

  // 2. Create a Demo Team
  const [team] = await db.insert(schema.teams).values({
    name: "Demo Varsity",
    orgId: org.id,
    inviteCode: "DEMO1",
    coachInviteCode: "COACH1",
    playerInviteCode: "PLAYER1",
  })
  .onConflictDoUpdate({
    target: schema.teams.inviteCode,
    set: { name: "Demo Varsity" }
  })
  .returning();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Demo Users
  const [admin, coach, player1, player2] = await db.insert(schema.users).values([
    {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Demo Admin",
      role: "admin",
    },
    {
      email: "coach@example.com",
      password: hashedPassword,
      name: "Demo Coach",
      role: "coach",
      teamId: team.id,
    },
    {
      email: "player@example.com",
      password: hashedPassword,
      name: "Demo Player",
      role: "player",
      teamId: team.id,
    },
    {
      email: "athlete2@example.com",
      password: hashedPassword,
      name: "Alex Smith",
      role: "player",
      teamId: team.id,
    },
  ])
  .onConflictDoUpdate({
    target: schema.users.email,
    set: {
      teamId: team.id,
    }
  })
  .returning();

  // 4. Create some Check-ins for today
  await db.insert(schema.checkIns).values([
    {
      playerId: player1.id,
      teamId: team.id,
      goal: "Master my jump serve",
      mentalRating: 8,
      physicalRating: 7,
      emotionalRating: 9,
    },
    {
      playerId: player2.id,
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
