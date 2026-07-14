CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `audit_logs_actor_created_idx` ON `audit_logs` (`actor_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `challenge_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`challenge_id` text NOT NULL,
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`status` text NOT NULL,
	`score` integer NOT NULL,
	`execution_ms` integer NOT NULL,
	`pipeline_duration_ms` integer NOT NULL,
	`results` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `challenge_submissions_user_challenge_idx` ON `challenge_submissions` (`user_id`,`challenge_id`);--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`difficulty` text NOT NULL,
	`topic_tags` text DEFAULT '[]' NOT NULL,
	`starter_files` text NOT NULL,
	`visible_checks` text NOT NULL,
	`hidden_checks` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `challenges_slug_uq` ON `challenges` (`slug`);--> statement-breakpoint
CREATE TABLE `daily_challenge_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`challenge_id` text NOT NULL,
	`challenge_date` text NOT NULL,
	`score` integer NOT NULL,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_challenge_user_date_uq` ON `daily_challenge_completions` (`user_id`,`challenge_date`);--> statement-breakpoint
CREATE TABLE `discussion_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`discussion_id` text NOT NULL,
	`author_id` text NOT NULL,
	`parent_id` text,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`discussion_id`) REFERENCES `discussions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `discussion_comments_thread_idx` ON `discussion_comments` (`discussion_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `discussion_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`discussion_id` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`discussion_id`) REFERENCES `discussions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `discussion_votes_user_discussion_uq` ON `discussion_votes` (`user_id`,`discussion_id`);--> statement-breakpoint
CREATE TABLE `discussions` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`topic` text NOT NULL,
	`helpful_comment_id` text,
	`locked_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `discussions_created_idx` ON `discussions` (`created_at`);