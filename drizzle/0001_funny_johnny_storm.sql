CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`team_id` text NOT NULL,
	`rating` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` ADD `password` text;