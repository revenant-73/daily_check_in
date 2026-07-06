CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`rating` integer,
	`category` text DEFAULT 'general',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX `organizations_name_unique`;--> statement-breakpoint
DROP INDEX `teams_invite_code_unique`;--> statement-breakpoint
DROP INDEX `teams_coach_invite_code_unique`;--> statement-breakpoint
DROP INDEX `teams_player_invite_code_unique`;--> statement-breakpoint
ALTER TABLE `teams` ALTER COLUMN "coach_invite_code" TO "coach_invite_code" text;--> statement-breakpoint
ALTER TABLE `teams` ALTER COLUMN "player_invite_code" TO "player_invite_code" text;--> statement-breakpoint
DROP INDEX `users_email_unique`;