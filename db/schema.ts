import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("applicant"),
  emailVerifiedAt: text("email_verified_at"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const applicants = sqliteTable("applicants", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  discipline: text("discipline"),
  country: text("country"),
  yearsExperience: integer("years_experience").notNull().default(0),
  education: text("education"),
  credentials: text("credentials"),
  portfolioUrl: text("portfolio_url"),
  applicationStatus: text("application_status").notNull().default("draft"),
  currentStage: text("current_stage").notNull().default("email_verification"),
  qualityScore: real("quality_score").notNull().default(0),
  riskScore: real("risk_score").notNull().default(0),
  adminNotes: text("admin_notes"),
  assessmentRank: text("assessment_rank"),
  assessmentPercentile: real("assessment_percentile"),
  accessTier: text("access_tier").notNull().default("onboarding"),
  submittedAt: text("submitted_at"),
  decidedAt: text("decided_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const verificationChecks = sqliteTable("verification_checks", {
  id: text("id").primaryKey(),
  applicantId: text("applicant_id").notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull().default("manual"),
  status: text("status").notNull().default("pending"),
  score: real("score"),
  reason: text("reason"),
  providerReference: text("provider_reference"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const applicantDocuments = sqliteTable("applicant_documents", {
  id: text("id").primaryKey(),
  applicantId: text("applicant_id").notNull(),
  kind: text("kind").notNull(),
  objectKey: text("object_key").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("pending_review"),
  retentionUntil: text("retention_until").notNull(),
  createdAt: text("created_at").notNull(),
});

export const emailVerifications = sqliteTable("email_verifications", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  verifiedAt: text("verified_at"),
  createdAt: text("created_at").notNull(),
});

export const assessments = sqliteTable("assessments", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  discipline: text("discipline").notNull(),
  version: integer("version").notNull().default(1),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  passScore: real("pass_score").notNull().default(80),
  maxAttempts: integer("max_attempts").notNull().default(2),
  questionsJson: text("questions_json").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const assessmentAttempts = sqliteTable("assessment_attempts", {
  id: text("id").primaryKey(),
  applicantId: text("applicant_id").notNull(),
  assessmentId: text("assessment_id").notNull(),
  status: text("status").notNull().default("assigned"),
  answersJson: text("answers_json"),
  score: real("score"),
  integrityScore: real("integrity_score"),
  competencyScoresJson: text("competency_scores_json"),
  percentile: real("percentile"),
  rankBand: text("rank_band"),
  completionSeconds: integer("completion_seconds"),
  flagsJson: text("flags_json"),
  passed: integer("passed", { mode: "boolean" }),
  startedAt: text("started_at"),
  submittedAt: text("submitted_at"),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  discipline: text("discipline").notNull(),
  description: text("description").notNull(),
  requirementsJson: text("requirements_json").notNull(),
  rateMin: real("rate_min").notNull(),
  rateMax: real("rate_max").notNull(),
  rateUnit: text("rate_unit").notNull().default("task"),
  hoursPerWeek: text("hours_per_week"),
  location: text("location").notNull().default("Remote"),
  requiredQualityScore: real("required_quality_score").notNull().default(85),
  requiredVerificationLevel: text("required_verification_level").notNull().default("identity"),
  openings: integer("openings").notNull().default(1),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  closesAt: text("closes_at"),
  createdBy: text("created_by").notNull(),
  externalSourceId: text("external_source_id"),
  externalJobId: text("external_job_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const jobSources = sqliteTable("job_sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  accountSlug: text("account_slug").notNull(),
  status: text("status").notNull().default("active"),
  lastSyncAt: text("last_sync_at"),
  lastSyncStatus: text("last_sync_status"),
  lastSyncCount: integer("last_sync_count").notNull().default(0),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const jobApplications = sqliteTable("job_applications", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull(),
  trainerId: text("trainer_id").notNull(),
  coverNote: text("cover_note"),
  status: text("status").notNull().default("submitted"),
  matchScore: real("match_score").notNull().default(0),
  appliedAt: text("applied_at").notNull(),
  decidedAt: text("decided_at"),
  decidedBy: text("decided_by"),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadataJson: text("metadata_json").notNull().default("{}"),
  ipHash: text("ip_hash"),
  createdAt: text("created_at").notNull(),
});

export const authSessions = sqliteTable("auth_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  authMethod: text("auth_method").notNull(),
  mfaLevel: text("mfa_level").notNull().default("single_factor"),
  expiresAt: text("expires_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
  createdAt: text("created_at").notNull(),
});
