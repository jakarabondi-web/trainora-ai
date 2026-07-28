import { adminOnly } from "../../../../../../lib/server/access";
import { resolveDispute } from "../../../../../../lib/server/support";
import { apiError, audit } from "../../../../../../lib/server/trainora-store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const { resolution } = await request.json() as { resolution?: string };
    if (!String(resolution ?? "").trim()) return Response.json({ error: "A resolution note is required." }, { status: 400 });
    const { id: disputeId } = await context.params;
    await resolveDispute(disputeId, String(resolution));
    await audit(access.user!.email, "dispute.resolved", "dispute", disputeId, {});
    return Response.json({ status: "resolved" });
  } catch (error) {
    return apiError(error);
  }
}
