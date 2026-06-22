import { relations } from "drizzle-orm/relations";
import { teams, checkIns, users, reviews, organizations, reactions } from "./schema";

export const checkInsRelations = relations(checkIns, ({one, many}) => ({
	team: one(teams, {
		fields: [checkIns.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [checkIns.playerId],
		references: [users.id]
	}),
	reactions: many(reactions),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	checkIns: many(checkIns),
	reviews: many(reviews),
	organization: one(organizations, {
		fields: [teams.orgId],
		references: [organizations.id]
	}),
	users: many(users),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	checkIns: many(checkIns),
	reviews: many(reviews),
	team: one(teams, {
		fields: [users.teamId],
		references: [teams.id]
	}),
	reactions: many(reactions),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	team: one(teams, {
		fields: [reviews.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [reviews.playerId],
		references: [users.id]
	}),
}));

export const organizationsRelations = relations(organizations, ({many}) => ({
	teams: many(teams),
}));

export const reactionsRelations = relations(reactions, ({one}) => ({
	user: one(users, {
		fields: [reactions.coachId],
		references: [users.id]
	}),
	checkIn: one(checkIns, {
		fields: [reactions.checkInId],
		references: [checkIns.id]
	}),
}));