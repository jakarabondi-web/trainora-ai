ALTER TABLE `jobs` ADD `external_source_id` text;
--> statement-breakpoint
ALTER TABLE `jobs` ADD `external_job_id` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_external_source_job_unique`
ON `jobs` (`external_source_id`, `external_job_id`);
--> statement-breakpoint
CREATE TABLE `job_sources` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `provider` text NOT NULL,
  `account_slug` text NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `last_sync_at` text,
  `last_sync_status` text,
  `last_sync_count` integer DEFAULT 0 NOT NULL,
  `created_by` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_sources_provider_slug_unique`
ON `job_sources` (`provider`, `account_slug`);
