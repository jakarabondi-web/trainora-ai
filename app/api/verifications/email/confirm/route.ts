import { apiError, audit, database, now } from "../../../../../lib/server/trainora-store";

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const { verificationId, code, applicantId } = await request.json() as Record<string, string>;
    const db = database();
    const record = await db.prepare(
      "SELECT * FROM email_verifications WHERE id = ?",
    ).bind(verificationId).first() as { email: string; code_hash: string; expires_at: string; attempts: number; verified_at: string | null } | null;
    if (!record || record.verified_at) return Response.json({ error: "This code is no longer valid." }, { status: 400 });
    if (record.attempts >= 5) return Response.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    if (new Date(record.expires_at).getTime() < Date.now()) return Response.json({ error: "The code has expired." }, { status: 400 });
    const valid = await digest(`${verificationId}:${String(code)}`) === record.code_hash;
    if (!valid) {
      await db.prepare("UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?").bind(verificationId).run();
      return Response.json({ error: "Incorrect verification code." }, { status: 400 });
    }
    const applicant = await db.prepare(
      `SELECT a.user_id FROM applicants a JOIN users u ON u.id = a.user_id
       WHERE a.id = ? AND u.email = ?`,
    ).bind(applicantId, record.email).first() as { user_id: string } | null;
    if (!applicant) return Response.json({ error: "Application not found." }, { status: 404 });
    await db.batch([
      db.prepare("UPDATE email_verifications SET verified_at = ? WHERE id = ?").bind(now(), verificationId),
      db.prepare("UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?").bind(now(), now(), applicant.user_id),
      db.prepare("UPDATE applicants SET current_stage = 'identity_verification', updated_at = ? WHERE id = ?").bind(now(), applicantId),
    ]);
    await audit(applicant.user_id, "email.verified", "applicant", applicantId);
    return Response.json({ verified: true, nextStage: "identity_verification" });
  } catch (error) {
    return apiError(error);
  }
}

