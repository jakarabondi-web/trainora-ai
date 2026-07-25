import { env } from "cloudflare:workers";
import { apiError, audit, database, id, now } from "../../../../lib/server/trainora-store";

const allowedKinds = new Set(["id_front", "id_back", "selfie", "credential", "license"]);
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function POST(request: Request) {
  try {
    if (!env.DOCUMENTS) {
      return Response.json({ error: "Secure document storage is not connected.", code: "DOCUMENT_STORAGE_NOT_CONNECTED" }, { status: 503 });
    }
    const form = await request.formData();
    const applicantId = String(form.get("applicantId") ?? "");
    const kind = String(form.get("kind") ?? "");
    const consent = String(form.get("consent") ?? "") === "true";
    const file = form.get("file");
    if (!applicantId || !allowedKinds.has(kind) || !(file instanceof File)) {
      return Response.json({ error: "Application, document type, and file are required." }, { status: 400 });
    }
    if (!consent) return Response.json({ error: "Identity-processing consent is required." }, { status: 400 });
    if (!allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "Use a JPG, PNG, WEBP, or PDF no larger than 10 MB." }, { status: 400 });
    }
    const db = database();
    const applicant = await db.prepare("SELECT user_id FROM applicants WHERE id = ?").bind(applicantId).first() as { user_id: string } | null;
    if (!applicant) return Response.json({ error: "Application not found." }, { status: 404 });
    const documentId = id("doc");
    const objectKey = `applicants/${applicantId}/${documentId}`;
    await env.DOCUMENTS.put(objectKey, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { applicantId, kind, originalName: file.name },
    });
    const retentionUntil = new Date(Date.now() + 90 * 24 * 60 * 60_000).toISOString();
    await db.prepare(
      `INSERT INTO applicant_documents
       (id, applicant_id, kind, object_key, filename, content_type, size, status, retention_until, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, ?)`,
    ).bind(documentId, applicantId, kind, objectKey, file.name, file.type, file.size, retentionUntil, now()).run();
    await db.prepare(
      `INSERT INTO verification_checks
       (id, applicant_id, type, provider, status, reason, created_at, updated_at)
       VALUES (?, ?, ?, 'manual', 'pending', ?, ?, ?)`,
    ).bind(id("check"), applicantId, kind === "selfie" ? "selfie_liveness" : "government_id", "Evidence uploaded for restricted review.", now(), now()).run();
    await audit(applicant.user_id, "verification.document_uploaded", "document", documentId, { kind });
    return Response.json({ documentId, status: "pending_review", retentionUntil });
  } catch (error) {
    return apiError(error);
  }
}

