import { env } from "cloudflare:workers";
import { adminOnly } from "../../../../../lib/server/access";
import { apiError, audit, database, now } from "../../../../../lib/server/trainora-store";

export async function POST() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    if (!env.DOCUMENTS) return Response.json({ error: "Secure document storage is not connected." }, { status: 503 });
    const db = database();
    const expired = await db.prepare(
      "SELECT id, object_key FROM applicant_documents WHERE retention_until <= ?",
    ).bind(now()).all() as { results?: Array<{ id: string; object_key: string }> };
    const documents = expired.results ?? [];
    for (const document of documents) await env.DOCUMENTS.delete(document.object_key);
    if (documents.length) {
      const placeholders = documents.map(() => "?").join(",");
      await db.prepare(`DELETE FROM applicant_documents WHERE id IN (${placeholders})`)
        .bind(...documents.map((document) => document.id)).run();
    }
    await audit(access.user!.email, "retention.purge_completed", "document_batch", now(), { deleted: documents.length });
    return Response.json({ deleted: documents.length });
  } catch (error) {
    return apiError(error);
  }
}

