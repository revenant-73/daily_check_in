import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const checkIns = sqliteTable("check_ins", {
	id: text().primaryKey().notNull(),
	playerId: text("player_id").notNull().references(() => users.id),
	teamId: text("team_id").notNull().references(() => teams.id),
	goal: text().notNull(),
	mentalRating: integer("mental_rating").notNull(),
	physicalRating: integer("physical_rating").notNull(),
	emotionalRating: integer("emotional_rating").notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	pillar: text(),
	metadata: text(),
});

export const organizations = sqliteTable("organizations", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const reviews = sqliteTable("reviews", {
	id: text().primaryKey().notNull(),
	playerId: text("player_id").notNull().references(() => users.id),
	teamId: text("team_id").notNull().references(() => teams.id),
	rating: integer().notNull(),
	notes: text(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	nextSessionNotes: text("next_session_notes"),
	metadata: text(),
});

export const teams = sqliteTable("teams", {
	id: text().primaryKey().notNull(),
	orgId: text("org_id").notNull().references(() => organizations.id),
	name: text().notNull(),
	inviteCode: text("invite_code").notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	coachInviteCode: text("coach_invite_code"),
	playerInviteCode: text("player_invite_code"),
},
(table) => [
	uniqueIndex("teams_invite_code_unique").on(table.inviteCode),
]);

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	password: text(),
	role: text().default("player").notNull(),
	teamId: text("team_id").references(() => teams.id),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	uniqueIndex("users_email_unique").on(table.email),
]);

export const reactions = sqliteTable("reactions", {
	id: text().primaryKey().notNull(),
	checkInId: text("check_in_id").notNull().references(() => checkIns.id, { onDelete: "cascade" } ),
	coachId: text("coach_id").notNull().references(() => users.id),
	type: text().notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

