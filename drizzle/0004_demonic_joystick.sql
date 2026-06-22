ALTER TABLE `check_ins` ADD `pillar` text;--> statement-breakpoint
ALTER TABLE `check_ins` ADD `metadata` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `mental_rating` integer;--> statement-breakpoint
ALTER TABLE `reviews` ADD `physical_rating` integer;--> statement-breakpoint
ALTER TABLE `reviews` ADD `emotional_rating` integer;--> statement-breakpoint
ALTER TABLE `reviews` ADD `metadata` text;