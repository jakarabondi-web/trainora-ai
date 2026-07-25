import { env } from "cloudflare:workers";
import { adminOnly } from "../../../../../lib/server/access";
import { apiError, audit, database } from "../../../../../lib/server/trainora-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    if (!env.DOCUMENTS) return Response.json({ error: "Secure document storage is not connected." }, { status: 503 });
    const { id } = await context.params;
    const db = database();
    const record = await db.prepare(
      "SELECT object_key, filename, content_type, applicant_id FROM applicant_documents WHERE id = ?",
    ).bind(id).first() as { object_key: string; filename: string; content_type: string; applicant_id: string } | null;
    if (!record) return Response.json({ error: "Document not found." }, { status: 404 });
    const object = await env.DOCUMENTS.get(record.object_key);
    if (!object) return Response.json({ error: "Document object not found." }, { status: 404 });
    await audit(access.user!.email, "verification.document_viewed", "document", id, { applicantId: record.applicant_id });
    return new Response(object.body, {
      headers: {
        "Content-Type": record.content_type,
        "Content-Disposition": `inline; filename="${record.filename.replaceAll("\"", "")}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

