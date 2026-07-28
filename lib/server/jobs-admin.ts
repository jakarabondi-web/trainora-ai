import type { ImportedJob } from "../job-import";
import { database, id, now } from "./trainora-store";

export async function insertImportedJobs(jobs: ImportedJob[], actor: string, sourceId?: string) {
  const db = database();
  const timestamp = now();
  const statements = jobs.map((job) => db.prepare(
    `INSERT INTO jobs
      (id, title, client_name, discipline, description, requirements_json, rate_min, rate_max,
       rate_unit, hours_per_week, location, required_quality_score, required_verification_level,
       openings, status, published_at, closes_at, created_by, external_source_id, external_job_id,
       created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'identity_and_credentials', ?, 'published',
       ?, NULL, ?, ?, NULL, ?, ?)`,
  ).bind(
    id("job"), job.title, job.clientName, job.discipline, job.description,
    JSON.stringify(job.requirements), job.rateMin, job.rateMax, job.rateUnit,
    job.hoursPerWeek, job.location, job.requiredQualityScore, job.openings,
    timestamp, actor, sourceId ?? null, timestamp, timestamp,
  ));
  if (statements.length) await db.batch(statements);
  return statements.length;
}

export function cleanExternalText(value: unknown, fallback: string) {
  const text = String(value ?? "")
    .replaceAll(/<[^>]*>/g, " ")
    .replaceAll(/&nbsp;|&#160;/g, " ")
    .replaceAll(/&amp;/g, "&")
    .replaceAll(/\s+/g, " ")
    .trim();
  return text.slice(0, 4_000) || fallback;
}

export function externalJobRows(
  provider: string,
  payload: unknown,
  clientName: string,
): Array<ImportedJob & { externalId: string }> {
  if (provider === "greenhouse") {
    const jobs = (payload as { jobs?: Array<Record<string, unknown>> })?.jobs ?? [];
    return jobs.slice(0, 250).map((job) => ({
      externalId: String(job.id),
      title: cleanExternalText(job.title, "Untitled opportunity"),
      clientName,
      discipline: "General",
      description: cleanExternalText(job.content, "Imported from Greenhouse. Add the project scope before trainer assignment."),
      requirements: ["Imported from Greenhouse", "Administrator quality review required"],
      rateMin: 0,
      rateMax: 0,
      rateUnit: "hour",
      hoursPerWeek: "To be confirmed",
      location: cleanExternalText((job.location as { name?: unknown })?.name, "Remote"),
      requiredQualityScore: 85,
      openings: 1,
    }));
  }
  if (provider === "lever") {
    const jobs = Array.isArray(payload) ? payload as Array<Record<string, unknown>> : [];
    return jobs.slice(0, 250).map((job) => {
      const categories = job.categories as Record<string, unknown> | undefined;
      return {
        externalId: String(job.id),
        title: cleanExternalText(job.text, "Untitled opportunity"),
        clientName,
        discipline: cleanExternalText(categories?.team ?? categories?.department, "General"),
        description: cleanExternalText(job.descriptionPlain ?? job.description, "Imported from Lever. Add the project scope before trainer assignment."),
        requirements: ["Imported from Lever", "Administrator quality review required"],
        rateMin: 0,
        rateMax: 0,
        rateUnit: "hour" as const,
        hoursPerWeek: cleanExternalText(categories?.commitment, "To be confirmed"),
        location: cleanExternalText(categories?.location, "Remote"),
        requiredQualityScore: 85,
        openings: 1,
      };
    });
  }
  throw new Error("Unsupported job source provider.");
}
