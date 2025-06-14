CREATE TABLE `canvas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`base_name` text,
	`title` text,
	`alias` text,
	`set_number` text,
	`card_type` text,
	`rarity` text,
	`canvas` integer,
	`frame_material` integer,
	`artist` text,
	`set_id` text,
	`render` text,
	`attack` integer,
	`defense` integer,
	`serialized_stellar` integer,
	`serialized_population` integer,
	`is_origin` integer,
	`prize_rank` integer,
	`printed_effect` text,
	`effect_id` text,
	`subclass_1` integer,
	`subclass_2` integer,
	`cost_display` text,
	`total_cost` integer,
	`fire_cost` integer,
	`earth_cost` integer,
	`thunder_cost` integer,
	`water_cost` integer,
	`wind_cost` integer,
	`frost_cost` integer,
	`lunar_cost` integer,
	`solar_cost` integer,
	`omni_cost` integer,
	FOREIGN KEY (`canvas`) REFERENCES `canvas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`frame_material`) REFERENCES `frames`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`set_id`) REFERENCES `sets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subclass_1`) REFERENCES `subclasses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subclass_2`) REFERENCES `subclasses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `effects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`effect` text
);
--> statement-breakpoint
CREATE TABLE `frames` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`image` text,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `sets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`abbr` text,
	`series_id` text,
	`series_code` text,
	`release_date` datetime,
	`image` text,
	`icon` text,
	`stamp` text,
	`logo` text,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subclasses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`variant` text,
	`card_id` text,
	`image` text,
	`is_primary` integer,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE no action
);
