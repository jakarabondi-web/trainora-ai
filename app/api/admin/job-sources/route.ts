import { adminOnly } from "../../../../lib/server/access";
import { apiError, audit, database, id, now } from "../../../../lib/server/trainora-store";

type SourceRow = {
  id: string;
  name: string;
  provider: string;
  account_slug: string;
  status: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_count: number;
};

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const result = await database().prepare(
      `SELECT id, name, provider, account_slug, status, last_sync_at, last_sync_status, last_sync_count
       FROM job_sources ORDER BY created_at DESC`,
    ).all() as { results?: SourceRow[] };
    return Response.json({ sources: result.results ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const body = await request.json() as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const provider = String(body.provider ?? "").toLowerCase();
    const accountSlug = String(body.accountSlug ?? "").trim();
    if (!name) return Response.json({ error: "Source name is required." }, { status: 400 });
    if (!["greenhouse", "lever"].includes(provider)) {
      return Response.json({ error: "Choose Greenhouse or Lever." }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,79}$/.test(accountSlug)) {
      return Response.json({ error: "Enter a valid board or site identifier." }, { status: 400 });
    }
    const sourceId = id("source");
    const timestamp = now();
    await database().prepare(
      `INSERT INTO job_sources
       (id, name, provider, account_slug, status, last_sync_count, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', 0, ?, ?, ?)`,
    ).bind(sourceId, name, provider, accountSlug, access.user!.email, timestamp, timestamp).run();
    await audit(access.user!.email, "job_source.created", "job_source", sourceId, { provider, accountSlug });
    return Response.json({ sourceId }, { status: 201 });
  } catch (error) {
    if (String(error).includes("UNIQUE")) {
      return Response.json({ error: "That provider connection already exists." }, { status: 409 });
    }
    return apiError(error);
  }
}
