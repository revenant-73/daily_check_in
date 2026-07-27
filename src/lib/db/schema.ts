import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgId: text("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(), // Legacy field required by DB
  coachInviteCode: text("coach_invite_code").unique(),
  playerInviteCode: text("player_invite_code").unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
  index("teams_org_id_idx").on(table.orgId),
]);

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  password: text("password"),
  role: text("role", { enum: ["admin", "coach", "player"] }).default("player").notNull(),
  teamId: text("team_id").references(() => teams.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
  uniqueIndex("users_email_normalized_unique").on(sql`lower(trim(${table.email}))`),
  index("users_team_id_idx").on(table.teamId),
]);

export const checkIns = sqliteTable("check_ins", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text("player_id").notNull().references(() => users.id),
  teamId: text("team_id").notNull().references(() => teams.id),
  goal: text("goal").notNull(),
  pillar: text("pillar"), // Kept for legacy compatibility
  metadata: text("metadata"), // Flexible JSON storage
  mentalRating: integer("mental_rating").notNull(),
  physicalRating: integer("physical_rating").notNull(),
  emotionalRating: integer("emotional_rating").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
  check("check_ins_mental_rating_range", sql`${table.mentalRating} between 1 and 10`),
  check("check_ins_physical_rating_range", sql`${table.physicalRating} between 1 and 10`),
  check("check_ins_emotional_rating_range", sql`${table.emotionalRating} between 1 and 10`),
  index("check_ins_player_created_at_idx").on(table.playerId, table.createdAt),
  index("check_ins_team_created_at_idx").on(table.teamId, table.createdAt),
]);

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text("player_id").notNull().references(() => users.id),
  teamId: text("team_id").notNull().references(() => teams.id),
  rating: integer("rating").notNull(), // 1-5 how practice went
  mentalRating: integer("mental_rating"),
  physicalRating: integer("physical_rating"),
  emotionalRating: integer("emotional_rating"),
  notes: text("notes"),
  metadata: text("metadata"), // Flexible JSON storage
  nextSessionNotes: text("next_session_notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
  check("reviews_rating_range", sql`${table.rating} between 1 and 5`),
  check(
    "reviews_mental_rating_range",
    sql`${table.mentalRating} is null or ${table.mentalRating} between 1 and 10`
  ),
  check(
    "reviews_physical_rating_range",
    sql`${table.physicalRating} is null or ${table.physicalRating} between 1 and 10`
  ),
  check(
    "reviews_emotional_rating_range",
    sql`${table.emotionalRating} is null or ${table.emotionalRating} between 1 and 10`
  ),
  index("reviews_player_created_at_idx").on(table.playerId, table.createdAt),
  index("reviews_team_created_at_idx").on(table.teamId, table.createdAt),
]);

export const reactions = sqliteTable("reactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  checkInId: text("check_in_id").notNull().references(() => checkIns.id, { onDelete: 'cascade' }),
  coachId: text("coach_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'high-five', 'fire', 'muscle', etc.
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
  uniqueIndex("reactions_check_in_coach_type_unique").on(
    table.checkInId,
    table.coachId,
    table.type
  ),
  index("reactions_coach_id_idx").on(table.coachId),
]);

export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  rating: integer("rating"), // Optional general satisfaction rating
  category: text("category").default("general"), // 'bug', 'feature', 'ui', 'general'
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => [
  check(
    "feedback_rating_range",
    sql`${table.rating} is null or ${table.rating} between 1 and 5`
  ),
  index("feedback_user_created_at_idx").on(table.userId, table.createdAt),
]);
