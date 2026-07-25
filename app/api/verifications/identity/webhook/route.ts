import { env } from "cloudflare:workers";
import { apiError, audit, database, now, notify } from "../../../../../lib/server/trainora-store";

function hexToBytes(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
}

async function validStripeSignature(payload: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(",").map((item) => item.split("=", 2)));
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300 || !parts.v1) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, hexToBytes(parts.v1), new TextEncoder().encode(`${parts.t}.${payload}`));
}

export async function POST(request: Request) {
  try {
    if (!env.STRIPE_IDENTITY_WEBHOOK_SECRET) {
      return Response.json({ error: "Identity webhook secret is not configured." }, { status: 503 });
    }
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";
    if (!await validStripeSignature(payload, signature, env.STRIPE_IDENTITY_WEBHOOK_SECRET)) {
      return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
    }
    const event = JSON.parse(payload) as {
      type: string;
      data: { object: { id: string; status: string; metadata?: Record<string, string>; last_error?: { reason?: string; code?: string } } };
    };
    if (!["identity.verification_session.verified", "identity.verification_session.requires_input", "identity.verification_session.canceled"].includes(event.type)) {
      return Response.json({ received: true });
    }
    const session = event.data.object;
    const applicantId = session.metadata?.applicant_id;
    const checkId = session.metadata?.trainora_check_id;
    if (!applicantId || !checkId) return Response.json({ error: "Verification metadata is missing." }, { status: 400 });
    const db = database();
    const applicant = await db.prepare("SELECT user_id FROM applicants WHERE id = ?").bind(applicantId).first() as { user_id: string } | null;
    if (!applicant) return Response.json({ error: "Applicant not found." }, { status: 404 });
    const passed = event.type === "identity.verification_session.verified";
    const status = passed ? "passed" : event.type.endsWith("requires_input") ? "needs_review" : "failed";
    const reason = passed ? "Stripe Identity verified the document and matching selfie." : session.last_error?.reason ?? session.last_error?.code ?? "Additional identity evidence is required.";
    await db.batch([
      db.prepare(
        `UPDATE verification_checks SET status = ?, score = ?, reason = ?, reviewed_at = ?, updated_at = ?
         WHERE id = ? AND applicant_id = ?`,
      ).bind(status, passed ? 100 : null, reason, now(), now(), checkId, applicantId),
      ...(passed ? [
        db.prepare(
          `INSERT INTO verification_checks
           (id, applicant_id, type, provider, status, score, reason, provider_reference, reviewed_at, created_at, updated_at)
           VALUES (?, ?, 'selfie_liveness', 'stripe_identity', 'passed', 100, ?, ?, ?, ?, ?)`,
        ).bind(`${checkId}_selfie`, applicantId, "Matching selfie requirement passed.", session.id, now(), now(), now()),
      ] : []),
    ]);
    await notify(applicant.user_id, "identity_verification", passed ? "Identity verification passed" : "Identity verification needs attention", reason, "/apply");
    await audit("stripe_identity", `identity.${status}`, "verification_check", checkId, { applicantId, sessionId: session.id });
    return Response.json({ received: true });
  } catch (error) {
    return apiError(error);
  }
}

