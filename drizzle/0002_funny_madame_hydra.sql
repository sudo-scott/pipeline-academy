CREATE TABLE `beta_challenge_state` (
	`email` text NOT NULL,
	`challenge_id` text NOT NULL,
	`draft` text DEFAULT '' NOT NULL,
	`submissions` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`email`, `challenge_id`),
	FOREIGN KEY (`email`) REFERENCES `beta_members`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `beta_lesson_state` (
	`email` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`email`, `lesson_id`),
	FOREIGN KEY (`email`) REFERENCES `beta_members`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `beta_members` (
	`email` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`joined_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL
);
