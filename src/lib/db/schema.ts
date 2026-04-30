import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  teams: many(teams),
}));

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgId: text("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  coachInviteCode: text("coach_invite_code").unique().notNull(),
  playerInviteCode: text("player_invite_code").unique().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.orgId],
    references: [organizations.id],
  }),
  users: many(users),
}));

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role", { enum: ["admin", "coach", "player"] }).default("player").notNull(),
  teamId: text("team_id").references(() => teams.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const usersRelations = relations(users, ({ one }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
}));

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
