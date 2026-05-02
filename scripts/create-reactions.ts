import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Creating reactions table...");
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS reactions (
        id text PRIMARY KEY NOT NULL,
        check_in_id text NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
        coach_id text NOT NULL REFERENCES users(id),
        type text NOT NULL,
        created_at integer DEFAULT (strftime('%s', 'now'))
      );
    `);
    console.log("Success!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
