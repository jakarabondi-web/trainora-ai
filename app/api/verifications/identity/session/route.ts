import { env } from "cloudflare:workers";
import { apiError, audit, database, id, now } from "../../../../../lib/server/trainora-store";

export async function POST(request: Request) {
  try {
    const { applicantId, returnUrl, consent } = await request.json() as { applicantId?: string; returnUrl?: string; consent?: boolean };
    if (!applicantId || !consent) return Response.json({ error: "Application and identity-processing consent are required." }, { status: 400 });
    const db = database();
    const applicant = await db.prepare("SELECT user_id FROM applicants WHERE id = ?").bind(applicantId).first() as { user_id: string } | null;
    if (!applicant) return Response.json({ error: "Application not found." }, { status: 404 });
    if (!env.STRIPE_SECRET_KEY) {
      return Response.json({
        status: "configuration_required",
        code: "IDENTITY_PROVIDER_NOT_CONNECTED",
        message: "Connect Stripe Identity to verify government documents and require a matching selfie.",
        manualUploadUrl: "/api/verifications/documents",
      }, { status: 503 });
    }

    const checkId = id("check");
    const form = new URLSearchParams();
    form.set("type", "document");
    form.set("options[document][require_matching_selfie]", "true");
    form.set("metadata[applicant_id]", applicantId);
    form.set("metadata[trainora_check_id]", checkId);
    if (returnUrl) form.set("return_url", returnUrl);
    const providerResponse = await fetch("https://api.stripe.com/v1/identity/verification_sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!providerResponse.ok) throw new Error("The identity provider did not create a session.");
    const session = await providerResponse.json() as { id?: string; url?: string };
    await db.prepare(
      `INSERT INTO verification_checks
       (id, applicant_id, type, provider, status, provider_reference, reason, created_at, updated_at)
       VALUES (?, ?, 'identity_bundle', 'stripe_identity', 'in_progress', ?, 'Government document authenticity and matching selfie.', ?, ?)`,
    ).bind(checkId, applicantId, session.id ?? checkId, now(), now()).run();
    await audit(applicant.user_id, "verification.identity_session_created", "verification_check", checkId);
    return Response.json({ checkId, status: "in_progress", redirectUrl: session.url });
  } catch (error) {
    return apiError(error);
  }
}
