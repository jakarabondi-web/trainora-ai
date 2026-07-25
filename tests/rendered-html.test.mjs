import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const file = (path) => new URL(path, root);

test("ships durable application, verification, assessment, and job storage", async () => {
  const [schema, hosting, migration] = await Promise.all([
    readFile(file("db/schema.ts"), "utf8"),
    readFile(file(".openai/hosting.json"), "utf8"),
    readFile(file("drizzle/0000_strong_mandroid.sql"), "utf8"),
  ]);

  for (const table of [
    "users",
    "applicants",
    "verification_checks",
    "applicant_documents",
    "email_verifications",
    "assessments",
    "assessment_attempts",
    "jobs",
    "job_applications",
    "notifications",
    "audit_events",
  ]) {
    assert.match(schema, new RegExp(`"${table}"`));
    assert.match(migration, new RegExp(`CREATE TABLE \\\`${table}\\\``));
  }
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": "DOCUMENTS"/);
});

test("enforces mandatory quality gates before trainer approval", async () => {
  const [decision, identity, assessment] = await Promise.all([
    readFile(file("app/api/admin/applicants/[id]/decision/route.ts"), "utf8"),
    readFile(file("app/api/verifications/identity/session/route.ts"), "utf8"),
    readFile(file("app/api/assessments/attempts/[id]/route.ts"), "utf8"),
  ]);

  for (const gate of [
    "email_verified_at",
    "identity_passed",
    "selfie_passed",
    "credentials_passed",
    "account_risk_passed",
    "assessment_passed",
  ]) assert.match(decision, new RegExp(gate));
  assert.match(identity, /require_matching_selfie/);
  assert.match(identity, /Stripe Identity/);
  assert.match(assessment, /integrityScore/);
  assert.match(assessment, /passed/);
});

test("connects the admin controls and trainer jobs marketplace to API routes", async () => {
  const [admin, trainerJobs, application] = await Promise.all([
    readFile(file("app/admin/AdminDashboard.tsx"), "utf8"),
    readFile(file("app/trainer/TrainerJobs.tsx"), "utf8"),
    readFile(file("app/apply/ApplicationFlow.tsx"), "utf8"),
  ]);

  assert.match(admin, /Approval command center/);
  assert.match(admin, /Pass government ID/);
  assert.match(admin, /Approve trainer/);
  assert.match(admin, /Publish a job/);
  assert.match(trainerJobs, /\/api\/jobs/);
  assert.match(trainerJobs, /Jobs marketplace/);
  assert.match(application, /Strict approval process/);
  assert.match(application, /Verify with government ID and matching selfie/);

  for (const route of [
    "app/api/applications/route.ts",
    "app/api/verifications/email/confirm/route.ts",
    "app/api/verifications/identity/webhook/route.ts",
    "app/api/assessments/assign/route.ts",
    "app/api/jobs/[id]/apply/route.ts",
    "app/api/admin/operations-analytics/route.ts",
  ]) await access(file(route));
});
