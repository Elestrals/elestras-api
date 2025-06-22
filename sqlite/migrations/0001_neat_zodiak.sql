ALTER TABLE `sets` RENAME COLUMN "abbr" TO "set_code";--> statement-breakpoint
ALTER TABLE `cards` ADD `set_order` text;--> statement-breakpoint
ALTER TABLE `cards` ADD `is_prize_card` integer;