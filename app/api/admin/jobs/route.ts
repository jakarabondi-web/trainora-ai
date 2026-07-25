import { adminOnly } from "../../../../lib/server/access";
import { apiError, audit, database, ensureSeedJobs, getJobs, id, now } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    await ensureSeedJobs();
    return Response.json({ jobs: await getJobs() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const body = await request.json() as Record<string, unknown>;
    for (const field of ["title", "clientName", "discipline", "description"]) {
      if (!String(body[field] ?? "").trim()) return Response.json({ error: `${field} is required.` }, { status: 400 });
    }
    const jobId = id("job");
    const status = body.status === "published" ? "published" : "draft";
    const timestamp = now();
    await database().prepare(
      `INSERT INTO jobs
       (id, title, client_name, discipline, description, requirements_json, rate_min, rate_max,
        rate_unit, hours_per_week, location, required_quality_score, required_verification_level,
        openings, status, published_at, closes_at, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      jobId,
      String(body.title),
      String(body.clientName),
      String(body.discipline),
      String(body.description),
      JSON.stringify(body.requirements ?? []),
      Number(body.rateMin ?? 0),
      Number(body.rateMax ?? 0),
      String(body.rateUnit ?? "task"),
      String(body.hoursPerWeek ?? ""),
      String(body.location ?? "Remote"),
      Number(body.requiredQualityScore ?? 85),
      String(body.requiredVerificationLevel ?? "identity_and_credentials"),
      Number(body.openings ?? 1),
      status,
      status === "published" ? timestamp : null,
      body.closesAt ? String(body.closesAt) : null,
      access.user!.email,
      timestamp,
      timestamp,
    ).run();
    await audit(access.user!.email, "job.created", "job", jobId, { status });
    return Response.json({ jobId, status }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

