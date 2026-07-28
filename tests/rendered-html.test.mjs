import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const file = (path) => new URL(path, root);

test("ships durable application, verification, assessment, and job storage", async () => {
  const [schema, hosting, initialMigration, jobSourcesMigration] = await Promise.all([
    readFile(file("db/schema.ts"), "utf8"),
    readFile(file(".openai/hosting.json"), "utf8"),
    readFile(file("drizzle/0000_strong_mandroid.sql"), "utf8"),
    readFile(file("drizzle/0001_job_sources.sql"), "utf8"),
  ]);
  const migration = `${initialMigration}\n${jobSourcesMigration}`;

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
    "job_sources",
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
    "app/api/admin/jobs/import/route.ts",
    "app/api/admin/job-sources/route.ts",
    "app/api/admin/job-sources/[id]/sync/route.ts",
  ]) await access(file(route));
});

test("dashboard menus use real destinations instead of placeholder links", async () => {
  const dashboards = await Promise.all([
    readFile(file("app/admin/AdminDashboard.tsx"), "utf8"),
    readFile(file("app/trainer/page.tsx"), "utf8"),
    readFile(file("app/client/page.tsx"), "utf8"),
    readFile(file("app/reviewer/page.tsx"), "utf8"),
  ]);
  for (const dashboard of dashboards) {
    assert.doesNotMatch(dashboard, /href=["']#["']/);
  }
  assert.match(dashboards[1], /#jobs/);
  assert.match(dashboards[1], /#payments/);
  assert.match(dashboards[2], /#integrations/);
  assert.match(dashboards[3], /#adjudications/);
});

test("admin navigation exposes a complete, routable control surface", async () => {
  const [sidebar, jobsManager, roles, styles] = await Promise.all([
    readFile(file("app/admin/AdminSidebar.tsx"), "utf8"),
    readFile(file("app/admin/jobs/AdminJobsManager.tsx"), "utf8"),
    readFile(file("app/roles/page.tsx"), "utf8"),
    readFile(file("app/globals.css"), "utf8"),
  ]);

  for (const route of [
    "/admin/applicants", "/admin/trainers", "/admin/clients", "/admin/reviewers",
    "/admin/jobs", "/admin/projects", "/admin/tasks", "/admin/reviews",
    "/admin/quality", "/admin/assessments", "/admin/gold-tasks", "/admin/calibration",
    "/admin/earnings", "/admin/invoices", "/admin/disputes", "/admin/tickets",
    "/admin/alerts", "/admin/audit-logs", "/admin/fraud", "/admin/settings", "/roles",
  ]) assert.match(sidebar, new RegExp(route.replace("/", "\\/")));

  assert.match(jobsManager, /Import jobs from CSV/);
  assert.match(jobsManager, /Greenhouse/);
  assert.match(jobsManager, /Lever/);
  assert.match(jobsManager, /Sync now/);
  assert.match(roles, /PERMISSIONS MATRIX/);
  assert.match(styles, /\.dashboardDarkSide/);
  assert.match(styles, /\.dashboardDarkSide\.(?:guideSide|portalSide) nav a:hover/);
});

test("uses semantic iconography and an animated technical homepage background", async () => {
  const [iconSystem, homepage, styles, packageJson] = await Promise.all([
    readFile(file("app/components/DashboardIcon.tsx"), "utf8"),
    readFile(file("app/page.tsx"), "utf8"),
    readFile(file("app/globals.css"), "utf8"),
    readFile(file("package.json"), "utf8"),
  ]);

  assert.match(packageJson, /lucide-react/);
  assert.match(iconSystem, /BriefcaseBusiness/);
  assert.match(iconSystem, /ShieldCheck/);
  assert.match(homepage, /TechLiveBackground/);
  assert.match(homepage, /Live evaluation/);
  assert.match(styles, /techLiveBackground/);
  assert.match(styles, /prefers-reduced-motion/);
});

test("ships the selected live global network and four-step icon workflow", async () => {
  const [homepage, styles] = await Promise.all([
    readFile(file("app/page.tsx"), "utf8"),
    readFile(file("app/globals.css"), "utf8"),
    access(file("public/trainora-world-grid-2k.png")),
  ]);

  assert.match(homepage, /LiveWorldNetwork/);
  assert.match(homepage, /ScaleWorkflow/);
  assert.match(homepage, /trainora-world-grid-2k\.png/);
  for (const label of ["North America", "Latin America", "Europe", "Africa", "East Asia", "Oceania"]) {
    assert.match(homepage, new RegExp(label));
  }
  for (const icon of ['"target"', '"users"', '"feedback"', '"integrations"']) {
    assert.match(homepage, new RegExp(icon));
  }
  assert.match(styles, /@keyframes route-flow/);
  assert.match(styles, /@keyframes hub-ring/);
  assert.match(styles, /@keyframes workflow-scan/);
});

test("uses animated capability symbols and focused platform questions", async () => {
  const [homepage, styles] = await Promise.all([
    readFile(file("app/page.tsx"), "utf8"),
    readFile(file("app/globals.css"), "utf8"),
  ]);

  assert.match(homepage, /techMiniFlow/);
  assert.match(homepage, /FAQSection/);
  assert.match(homepage, /How are experts verified\?/);
  assert.match(homepage, /What prevents substandard work\?/);
  assert.match(homepage, /Can Trainora support sensitive AI projects\?/);
  assert.doesNotMatch(homepage, /Building better systems/);
  assert.doesNotMatch(homepage, /Illustrative project/);
  assert.match(styles, /@keyframes mini-symbol-float/);
  assert.match(styles, /\.faqList details\[open\]/);
});

test("ships a focused, touch-safe mobile experience", async () => {
  const styles = await readFile(file("app/globals.css"), "utf8");

  assert.match(styles, /Mobile production standard/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /\.techLiveBackground\{inset:0;width:100%\}/);
  assert.match(styles, /\.platformPreview\{display:none\}/);
  assert.match(styles, /\.serviceGrid article:nth-child\(n\+5\)\{display:none\}/);
  assert.match(styles, /\.clientPortal \.topTools>a:last-child\{display:none\}/);
  assert.match(styles, /min-width:44px;min-height:48px/);
  assert.match(styles, /overflow-x:clip/);
});
