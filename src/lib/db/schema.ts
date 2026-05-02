import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgId: text("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  inviteCode: text("invite_code").unique().notNull(), // Legacy field required by DB
  coachInviteCode: text("coach_invite_code").unique().notNull(),
  playerInviteCode: text("player_invite_code").unique().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role", { enum: ["admin", "coach", "player"] }).default("player").notNull(),
  teamId: text("team_id").references(() => teams.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const checkIns = sqliteTable("check_ins", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text("player_id").notNull().references(() => users.id),
  teamId: text("team_id").notNull().references(() => teams.id),
  goal: text("goal").notNull(),
  mentalRating: integer("mental_rating").notNull(),
  physicalRating: integer("physical_rating").notNull(),
  emotionalRating: integer("emotional_rating").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text("player_id").notNull().references(() => users.id),
  teamId: text("team_id").notNull().references(() => teams.id),
  rating: integer("rating").notNull(), // 1-5 how practice went
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const reactions = sqliteTable("reactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  checkInId: text("check_in_id").notNull().references(() => checkIns.id, { onDelete: 'cascade' }),
  coachId: text("coach_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'high-five', 'fire', 'muscle', etc.
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});
