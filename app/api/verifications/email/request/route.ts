import { env } from "cloudflare:workers";
import { apiError, audit, database, id, now } from "../../../../../lib/server/trainora-store";

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const { email, applicantId } = await request.json() as { email?: string; applicantId?: string };
    const normalized = String(email ?? "").trim().toLowerCase();
    if (!normalized || !applicantId) return Response.json({ error: "Email and application are required." }, { status: 400 });
    const db = database();
    const applicant = await db.prepare(
      `SELECT a.user_id FROM applicants a JOIN users u ON u.id = a.user_id WHERE a.id = ? AND u.email = ?`,
    ).bind(applicantId, normalized).first() as { user_id: string } | null;
    if (!applicant) return Response.json({ error: "Application and email do not match." }, { status: 404 });

    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
    const verificationId = id("emailv");
    await db.prepare(
      `INSERT INTO email_verifications (id, email, code_hash, expires_at, attempts, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
    ).bind(verificationId, normalized, await digest(`${verificationId}:${code}`), new Date(Date.now() + 10 * 60_000).toISOString(), now()).run();

    let delivery = "configuration_required";
    if (env.RESEND_API_KEY && env.EMAIL_FROM) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "trainora-ai/1.0",
          "Idempotency-Key": verificationId,
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [normalized],
          subject: "Verify your Trainora AI application",
          html: `<p>Your Trainora AI verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
        }),
      });
      if (!response.ok) throw new Error("The verification email could not be sent.");
      delivery = "sent";
    }
    await audit(applicant.user_id, "email.verification_requested", "applicant", applicantId);
    return Response.json({
      verificationId,
      delivery,
      expiresInSeconds: 600,
      ...(env.DEV_AUTH_BYPASS === "true" ? { previewCode: code } : {}),
    });
  } catch (error) {
    return apiError(error);
  }
}
