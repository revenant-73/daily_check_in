import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  console.log("Testing DB connection...");
  console.log("URL:", process.env.TURSO_CONNECTION_URL);
  
  if (!process.env.TURSO_CONNECTION_URL) {
    console.error("Missing TURSO_CONNECTION_URL");
    return;
  }

  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client, { schema });

  try {
    const orgs = await db.select().from(schema.organizations).limit(1);
    console.log("Successfully connected! Orgs found:", orgs.length);
    
    const userCount = await db.select().from(schema.users);
    console.log("Users in DB:", userCount.length);
    
    if (userCount.length > 0) {
        console.log("Sample user:", { id: userCount[0].id, role: userCount[0].role, teamId: userCount[0].teamId });
    }
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
}

test();
