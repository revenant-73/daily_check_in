import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { createClient, type Client, type InValue } from "@libsql/client";

const migrationDirectory = path.resolve(process.cwd(), "drizzle");
const client = createClient({ url: ":memory:" });

async function expectConstraint(client: Client, sql: string, args: InValue[]) {
  await assert.rejects(
    client.execute({ sql, args }),
    (error: unknown) =>
      error instanceof Error &&
      /constraint|unique|check/i.test(error.message)
  );
}

async function applyMigrations() {
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((file) => /^\d{4}_.+\.sql$/.test(file))
    .sort();

  for (const migrationFile of migrationFiles) {
    const migration = await readFile(
      path.join(migrationDirectory, migrationFile),
      "utf8"
    );
    await client.executeMultiple(
      migration.replaceAll("--> statement-breakpoint", "\n")
    );
  }

  return migrationFiles;
}

async function verifyConstraints() {
  await client.execute("PRAGMA foreign_keys = ON");

  await client.execute({
    sql: "insert into organizations (id, name) values (?, ?)",
    args: ["org-1", "Test Organization"],
  });
  await client.execute({
    sql: `
      insert into teams (
        id, org_id, name, invite_code, coach_invite_code, player_invite_code
      ) values (?, ?, ?, ?, ?, ?)
    `,
    args: ["team-1", "org-1", "Varsity", "LEGACY", "COACH1", "PLAYER"],
  });
  await client.execute({
    sql: `
      insert into users (id, name, email, role, team_id)
      values (?, ?, ?, ?, ?)
    `,
    args: ["player-1", "Player One", "player@example.com", "player", "team-1"],
  });
  await client.execute({
    sql: `
      insert into users (id, name, email, role, team_id)
      values (?, ?, ?, ?, ?)
    `,
    args: ["coach-1", "Coach One", "coach@example.com", "coach", "team-1"],
  });
  await client.execute({
    sql: `
      insert into check_ins (
        id, player_id, team_id, goal,
        mental_rating, physical_rating, emotional_rating
      ) values (?, ?, ?, ?, ?, ?, ?)
    `,
    args: ["check-in-1", "player-1", "team-1", "Serve aggressively", 7, 8, 9],
  });
  await client.execute({
    sql: `
      insert into reviews (
        id, player_id, team_id, rating,
        mental_rating, physical_rating, emotional_rating
      ) values (?, ?, ?, ?, ?, ?, ?)
    `,
    args: ["review-1", "player-1", "team-1", 4, 7, 7, 8],
  });
  await client.execute({
    sql: `
      insert into reactions (id, check_in_id, coach_id, type)
      values (?, ?, ?, ?)
    `,
    args: ["reaction-1", "check-in-1", "coach-1", "high-five"],
  });

  await expectConstraint(
    client,
    "insert into users (id, email) values (?, ?)",
    ["player-2", " PLAYER@example.com "]
  );
  await expectConstraint(
    client,
    `
      insert into teams (
        id, org_id, name, invite_code, coach_invite_code, player_invite_code
      ) values (?, ?, ?, ?, ?, ?)
    `,
    ["team-2", "org-1", "JV", "LEGACY", "COACH2", "PLAYR2"]
  );
  await expectConstraint(
    client,
    `
      insert into check_ins (
        id, player_id, team_id, goal,
        mental_rating, physical_rating, emotional_rating
      ) values (?, ?, ?, ?, ?, ?, ?)
    `,
    ["check-in-2", "player-1", "team-1", "Invalid rating", 0, 5, 5]
  );
  await expectConstraint(
    client,
    `
      insert into reviews (id, player_id, team_id, rating)
      values (?, ?, ?, ?)
    `,
    ["review-2", "player-1", "team-1", 6]
  );
  await expectConstraint(
    client,
    `
      insert into reactions (id, check_in_id, coach_id, type)
      values (?, ?, ?, ?)
    `,
    ["reaction-2", "check-in-1", "coach-1", "high-five"]
  );

  const feedbackTable = await client.execute(
    "select name from sqlite_master where type = 'table' and name = 'feedback'"
  );
  assert.equal(feedbackTable.rows.length, 1);
}

async function main() {
  try {
    const migrations = await applyMigrations();
    await verifyConstraints();
    process.stdout.write(
      `Verified ${migrations.length} migrations and database constraints.\n`
    );
  } finally {
    client.close();
  }
}

void main();
