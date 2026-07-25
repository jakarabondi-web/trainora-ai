CREATE TABLE `applicant_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`kind` text NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`status` text DEFAULT 'pending_review' NOT NULL,
	`retention_until` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `applicants` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`discipline` text,
	`country` text,
	`years_experience` integer DEFAULT 0 NOT NULL,
	`education` text,
	`credentials` text,
	`portfolio_url` text,
	`application_status` text DEFAULT 'draft' NOT NULL,
	`current_stage` text DEFAULT 'email_verification' NOT NULL,
	`quality_score` real DEFAULT 0 NOT NULL,
	`risk_score` real DEFAULT 0 NOT NULL,
	`admin_notes` text,
	`submitted_at` text,
	`decided_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applicants_user_id_unique` ON `applicants` (`user_id`);--> statement-breakpoint
CREATE TABLE `assessment_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`assessment_id` text NOT NULL,
	`status` text DEFAULT 'assigned' NOT NULL,
	`answers_json` text,
	`score` real,
	`integrity_score` real,
	`passed` integer,
	`started_at` text,
	`submitted_at` text,
	`reviewed_by` text,
	`review_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`discipline` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`duration_minutes` integer DEFAULT 30 NOT NULL,
	`pass_score` real DEFAULT 80 NOT NULL,
	`max_attempts` integer DEFAULT 2 NOT NULL,
	`questions_json` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`ip_hash` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `email_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`verified_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `job_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`trainer_id` text NOT NULL,
	`cover_note` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`match_score` real DEFAULT 0 NOT NULL,
	`applied_at` text NOT NULL,
	`decided_at` text,
	`decided_by` text
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`client_name` text NOT NULL,
	`discipline` text NOT NULL,
	`description` text NOT NULL,
	`requirements_json` text NOT NULL,
	`rate_min` real NOT NULL,
	`rate_max` real NOT NULL,
	`rate_unit` text DEFAULT 'task' NOT NULL,
	`hours_per_week` text,
	`location` text DEFAULT 'Remote' NOT NULL,
	`required_quality_score` real DEFAULT 85 NOT NULL,
	`required_verification_level` text DEFAULT 'identity' NOT NULL,
	`openings` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`closes_at` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`action_url` text,
	`read_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text DEFAULT 'applicant' NOT NULL,
	`email_verified_at` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text DEFAULT 'manual' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`score` real,
	`reason` text,
	`provider_reference` text,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
