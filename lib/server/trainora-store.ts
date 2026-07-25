import { env } from "cloudflare:workers";
import type { ApplicantSummary, JobSummary } from "../trainora-types";

type Row = Record<string, unknown>;
type D1Result = { results?: Row[]; meta?: { changes?: number } };

export class StoreUnavailableError extends Error {}

export function database() {
  if (!env.DB) {
    throw new StoreUnavailableError("Trainora's production database is not connected.");
  }
  return env.DB as any;
}

export function now() {
  return new Date().toISOString();
}

export function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  const db = database();
  await db.prepare(
    `INSERT INTO audit_events
      (id, actor_id, action, entity_type, entity_id, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id("audit"), actorId, action, entityType, entityId, JSON.stringify(metadata), now()).run();
}

export async function notify(
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string,
) {
  const db = database();
  await db.prepare(
    `INSERT INTO notifications
      (id, user_id, type, title, message, action_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id("note"), userId, type, title, message, actionUrl ?? null, now()).run();
}

export async function getApplicants(): Promise<ApplicantSummary[]> {
  const db = database();
  const result = await db.prepare(
    `SELECT
      a.*, u.full_name, u.email, u.email_verified_at,
      aa.id AS attempt_id, aa.status AS attempt_status, aa.score AS attempt_score,
      aa.integrity_score, aa.passed, s.title AS assessment_title
     FROM applicants a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN assessment_attempts aa ON aa.id = (
       SELECT x.id FROM assessment_attempts x
       WHERE x.applicant_id = a.id ORDER BY x.created_at DESC LIMIT 1
     )
     LEFT JOIN assessments s ON s.id = aa.assessment_id
     ORDER BY COALESCE(a.submitted_at, a.created_at) DESC`,
  ).all() as D1Result;

  const rows = result.results ?? [];
  if (!rows.length) return [];
  const applicantIds = rows.map((row) => String(row.id));
  const placeholders = applicantIds.map(() => "?").join(",");
  const checksResult = await db.prepare(
    `SELECT id, applicant_id, type, status, score, reason
     FROM verification_checks WHERE applicant_id IN (${placeholders})
     ORDER BY created_at`,
  ).bind(...applicantIds).all() as D1Result;
  const checks = checksResult.results ?? [];
  const documentsResult = await db.prepare(
    `SELECT id, applicant_id, kind, filename, status, created_at
     FROM applicant_documents WHERE applicant_id IN (${placeholders})
     ORDER BY created_at`,
  ).bind(...applicantIds).all() as D1Result;
  const documents = documentsResult.results ?? [];

  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    fullName: String(row.full_name),
    email: String(row.email),
    emailVerified: Boolean(row.email_verified_at),
    discipline: String(row.discipline ?? "Not provided"),
    country: String(row.country ?? "Not provided"),
    yearsExperience: Number(row.years_experience ?? 0),
    applicationStatus: row.application_status as ApplicantSummary["applicationStatus"],
    currentStage: row.current_stage as ApplicantSummary["currentStage"],
    qualityScore: Number(row.quality_score ?? 0),
    riskScore: Number(row.risk_score ?? 0),
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    adminNotes: row.admin_notes ? String(row.admin_notes) : null,
    checks: checks.filter((check) => check.applicant_id === row.id).map((check) => ({
      id: String(check.id),
      type: String(check.type),
      status: String(check.status),
      score: check.score == null ? null : Number(check.score),
      reason: check.reason ? String(check.reason) : null,
    })),
    documents: documents.filter((document) => document.applicant_id === row.id).map((document) => ({
      id: String(document.id),
      kind: String(document.kind),
      filename: String(document.filename),
      status: String(document.status),
      createdAt: String(document.created_at),
    })),
    assessment: row.attempt_id ? {
      attemptId: String(row.attempt_id),
      title: String(row.assessment_title),
      status: String(row.attempt_status),
      score: row.attempt_score == null ? null : Number(row.attempt_score),
      integrityScore: row.integrity_score == null ? null : Number(row.integrity_score),
      passed: row.passed == null ? null : Boolean(row.passed),
    } : null,
  }));
}

export async function getJobs(trainerId?: string): Promise<JobSummary[]> {
  const db = database();
  const result = trainerId
    ? await db.prepare(
        `SELECT j.*, ja.status AS application_status, ja.match_score
         FROM jobs j
         LEFT JOIN job_applications ja ON ja.job_id = j.id AND ja.trainer_id = ?
         WHERE j.status = 'published'
         ORDER BY j.published_at DESC`,
      ).bind(trainerId).all() as D1Result
    : await db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all() as D1Result;
  return (result.results ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    clientName: String(row.client_name),
    discipline: String(row.discipline),
    description: String(row.description),
    requirements: JSON.parse(String(row.requirements_json || "[]")),
    rateMin: Number(row.rate_min),
    rateMax: Number(row.rate_max),
    rateUnit: String(row.rate_unit),
    hoursPerWeek: row.hours_per_week ? String(row.hours_per_week) : null,
    location: String(row.location),
    requiredQualityScore: Number(row.required_quality_score),
    openings: Number(row.openings),
    status: String(row.status),
    publishedAt: row.published_at ? String(row.published_at) : null,
    closesAt: row.closes_at ? String(row.closes_at) : null,
    applicationStatus: row.application_status ? String(row.application_status) : null,
    matchScore: row.match_score == null ? undefined : Number(row.match_score),
  }));
}

export async function ensureSeedJobs() {
  const db = database();
  const count = await db.prepare("SELECT COUNT(*) AS total FROM jobs").first() as { total: number };
  if (Number(count.total) > 0) return;
  const timestamp = now();
  const rows = [
    ["Medical QA Evaluation", "Cinder Research", "Medicine", "Evaluate clinical question-answer pairs for factuality, safety, and evidence quality.", ["Medical degree or clinical license", "95% calibration agreement", "Healthcare safety clearance"], 5, 8, "task", "10–15 hours", 92, 24],
    ["Legal Reasoning Dataset", "Nexora", "Law", "Review complex legal reasoning examples and label jurisdiction, citation support, and conclusion quality.", ["JD, LLB, or equivalent", "Professional legal experience", "Confidentiality assessment"], 45, 70, "hour", "8–12 hours", 90, 12],
    ["Code Generation Review", "Helix AI", "Software Engineering", "Score generated code for correctness, security, maintainability, and instruction adherence.", ["3+ years software engineering", "Secure coding assessment", "Git proficiency"], 6, 12, "task", "10–20 hours", 88, 40],
    ["Multilingual SFT Project", "Vector Labs", "Linguistics", "Create and review high-quality multilingual supervised fine-tuning examples.", ["Native or C2 language proficiency", "Editorial experience", "Language calibration"], 28, 42, "hour", "12–18 hours", 87, 30],
  ];
  const statements = rows.map((row) => db.prepare(
    `INSERT INTO jobs
     (id, title, client_name, discipline, description, requirements_json, rate_min, rate_max,
      rate_unit, hours_per_week, location, required_quality_score, required_verification_level,
      openings, status, published_at, closes_at, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Remote', ?, 'identity_and_credentials', ?,
      'published', ?, ?, 'system', ?, ?)`,
  ).bind(
    id("job"), row[0], row[1], row[2], row[3], JSON.stringify(row[4]), row[5], row[6],
    row[7], row[8], row[9], row[10], timestamp,
    new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString(), timestamp, timestamp,
  ));
  await db.batch(statements);
}

export function apiError(error: unknown) {
  if (error instanceof StoreUnavailableError) {
    return Response.json(
      { error: error.message, code: "DATABASE_NOT_CONNECTED" },
      { status: 503 },
    );
  }
  console.error(error);
  return Response.json({ error: "The request could not be completed." }, { status: 500 });
}
