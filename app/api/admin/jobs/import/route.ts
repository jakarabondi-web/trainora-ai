import { parseJobsCsv } from "../../../../../lib/job-import";
import { adminOnly } from "../../../../../lib/server/access";
import { insertImportedJobs } from "../../../../../lib/server/jobs-admin";
import { apiError, audit } from "../../../../../lib/server/trainora-store";

export async function POST(request: Request) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const body = await request.json() as { csv?: string };
    const jobs = parseJobsCsv(String(body.csv ?? ""));
    const imported = await insertImportedJobs(jobs, access.user!.email);
    await audit(access.user!.email, "jobs.csv_imported", "job_batch", crypto.randomUUID(), { imported });
    return Response.json({ imported }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && /CSV|row|column|job|MB/i.test(error.message)) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return apiError(error);
  }
}
