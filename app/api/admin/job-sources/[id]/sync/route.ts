import { adminOnly } from "../../../../../../lib/server/access";
import { cleanExternalText, externalJobRows } from "../../../../../../lib/server/jobs-admin";
import { apiError, audit, database, id, now } from "../../../../../../lib/server/trainora-store";

type Source = { id: string; name: string; provider: string; account_slug: string; status: string };

function sourceUrl(source: Source) {
  const slug = encodeURIComponent(source.account_slug);
  if (source.provider === "greenhouse") return `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`;
  if (source.provider === "lever") return `https://api.lever.co/v0/postings/${slug}?mode=json`;
  throw new Error("Unsupported provider.");
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const { id: sourceId } = await context.params;
    const db = database();
    const source = await db.prepare(
      "SELECT id, name, provider, account_slug, status FROM job_sources WHERE id = ?",
    ).bind(sourceId).first() as Source | null;
    if (!source) return Response.json({ error: "Job source not found." }, { status: 404 });
    if (source.status !== "active") return Response.json({ error: "This job source is paused." }, { status: 409 });

    const response = await fetch(sourceUrl(source), {
      headers: { Accept: "application/json", "User-Agent": "Trainora-AI-Job-Sync/1.0" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      await db.prepare(
        "UPDATE job_sources SET last_sync_at = ?, last_sync_status = 'failed', updated_at = ? WHERE id = ?",
      ).bind(now(), now(), sourceId).run();
      return Response.json({ error: `Provider returned ${response.status}. Check the board/site identifier.` }, { status: 502 });
    }
    const rows = externalJobRows(source.provider, await response.json(), source.name);
    const timestamp = now();
    const statements = rows.map((job) => db.prepare(
      `INSERT INTO jobs
       (id, title, client_name, discipline, description, requirements_json, rate_min, rate_max,
        rate_unit, hours_per_week, location, required_quality_score, required_verification_level,
        openings, status, published_at, closes_at, created_by, external_source_id, external_job_id,
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'identity_and_credentials', ?, 'published',
        ?, NULL, ?, ?, ?, ?, ?)
       ON CONFLICT(external_source_id, external_job_id) DO UPDATE SET
        title = excluded.title, client_name = excluded.client_name, discipline = excluded.discipline,
        description = excluded.description, requirements_json = excluded.requirements_json,
        hours_per_week = excluded.hours_per_week, location = excluded.location,
        updated_at = excluded.updated_at`,
    ).bind(
      id("job"), job.title, cleanExternalText(source.name, "External source"), job.discipline,
      job.description, JSON.stringify(job.requirements), job.rateMin, job.rateMax, job.rateUnit,
      job.hoursPerWeek, job.location, job.requiredQualityScore, job.openings, timestamp,
      access.user!.email, sourceId, job.externalId, timestamp, timestamp,
    ));
    if (statements.length) await db.batch(statements);
    await db.prepare(
      `UPDATE job_sources SET last_sync_at = ?, last_sync_status = 'succeeded',
       last_sync_count = ?, updated_at = ? WHERE id = ?`,
    ).bind(timestamp, rows.length, timestamp, sourceId).run();
    await audit(access.user!.email, "job_source.synced", "job_source", sourceId, { imported: rows.length });
    return Response.json({ imported: rows.length });
  } catch (error) {
    return apiError(error);
  }
}
