PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_check_ins` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`team_id` text NOT NULL,
	`goal` text NOT NULL,
	`pillar` text,
	`metadata` text,
	`mental_rating` integer NOT NULL,
	`physical_rating` integer NOT NULL,
	`emotional_rating` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "check_ins_mental_rating_range" CHECK("__new_check_ins"."mental_rating" between 1 and 10),
	CONSTRAINT "check_ins_physical_rating_range" CHECK("__new_check_ins"."physical_rating" between 1 and 10),
	CONSTRAINT "check_ins_emotional_rating_range" CHECK("__new_check_ins"."emotional_rating" between 1 and 10)
);
--> statement-breakpoint
INSERT INTO `__new_check_ins`("id", "player_id", "team_id", "goal", "pillar", "metadata", "mental_rating", "physical_rating", "emotional_rating", "created_at") SELECT "id", "player_id", "team_id", "goal", "pillar", "metadata", "mental_rating", "physical_rating", "emotional_rating", "created_at" FROM `check_ins`;--> statement-breakpoint
DROP TABLE `check_ins`;--> statement-breakpoint
ALTER TABLE `__new_check_ins` RENAME TO `check_ins`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `check_ins_player_created_at_idx` ON `check_ins` (`player_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `check_ins_team_created_at_idx` ON `check_ins` (`team_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`rating` integer,
	`category` text DEFAULT 'general',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "feedback_rating_range" CHECK("__new_feedback"."rating" is null or "__new_feedback"."rating" between 1 and 5)
);
--> statement-breakpoint
INSERT INTO `__new_feedback`("id", "user_id", "content", "rating", "category", "created_at") SELECT "id", "user_id", "content", "rating", "category", "created_at" FROM `feedback`;--> statement-breakpoint
DROP TABLE `feedback`;--> statement-breakpoint
ALTER TABLE `__new_feedback` RENAME TO `feedback`;--> statement-breakpoint
CREATE INDEX `feedback_user_created_at_idx` ON `feedback` (`user_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `reactions_check_in_coach_type_unique` ON `reactions` (`check_in_id`,`coach_id`,`type`);--> statement-breakpoint
CREATE INDEX `reactions_coach_id_idx` ON `reactions` (`coach_id`);--> statement-breakpoint
CREATE TABLE `__new_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`team_id` text NOT NULL,
	`rating` integer NOT NULL,
	`mental_rating` integer,
	`physical_rating` integer,
	`emotional_rating` integer,
	`notes` text,
	`metadata` text,
	`next_session_notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "reviews_rating_range" CHECK("__new_reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_mental_rating_range" CHECK("__new_reviews"."mental_rating" is null or "__new_reviews"."mental_rating" between 1 and 10),
	CONSTRAINT "reviews_physical_rating_range" CHECK("__new_reviews"."physical_rating" is null or "__new_reviews"."physical_rating" between 1 and 10),
	CONSTRAINT "reviews_emotional_rating_range" CHECK("__new_reviews"."emotional_rating" is null or "__new_reviews"."emotional_rating" between 1 and 10)
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("id", "player_id", "team_id", "rating", "mental_rating", "physical_rating", "emotional_rating", "notes", "metadata", "next_session_notes", "created_at") SELECT "id", "player_id", "team_id", "rating", "mental_rating", "physical_rating", "emotional_rating", "notes", "metadata", "next_session_notes", "created_at" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;--> statement-breakpoint
CREATE INDEX `reviews_player_created_at_idx` ON `reviews` (`player_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `reviews_team_created_at_idx` ON `reviews` (`team_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_invite_code_unique` ON `teams` (`invite_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_coach_invite_code_unique` ON `teams` (`coach_invite_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_player_invite_code_unique` ON `teams` (`player_invite_code`);--> statement-breakpoint
CREATE INDEX `teams_org_id_idx` ON `teams` (`org_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_normalized_unique` ON `users` (lower(trim("email")));--> statement-breakpoint
CREATE INDEX `users_team_id_idx` ON `users` (`team_id`);