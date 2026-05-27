ALTER TABLE `reviews` ADD `next_session_notes` text;--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_name_unique` ON `organizations` (`name`);