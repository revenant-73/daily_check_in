CREATE TABLE `reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`check_in_id` text NOT NULL,
	`coach_id` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`check_in_id`) REFERENCES `check_ins`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `teams` ADD `coach_invite_code` text NOT NULL;--> statement-breakpoint
ALTER TABLE `teams` ADD `player_invite_code` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `teams_coach_invite_code_unique` ON `teams` (`coach_invite_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_player_invite_code_unique` ON `teams` (`player_invite_code`);