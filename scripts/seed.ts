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
  }).returning();

  // 2. Create a Demo Team
  const [team] = await db.insert(schema.teams).values({
    name: "Demo Varsity",
    orgId: org.id,
    inviteCode: "DEMO123",
  }).returning();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Demo Users
  await db.insert(schema.users).values([
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
  ]);

  console.log("Database seeded successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
