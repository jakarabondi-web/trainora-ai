import { getCurrentUser } from "../../../lib/server/current-user";
import { createDispute, listDisputes } from "../../../lib/server/support";
import { apiError, audit } from "../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    return Response.json({ disputes: await listDisputes(user.role === "admin" ? undefined : user.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const { subjectType, subjectId, reason } = await request.json() as { subjectType?: string; subjectId?: string; reason?: string };
    if (!String(subjectType ?? "").trim() || !String(subjectId ?? "").trim() || !String(reason ?? "").trim()) {
      return Response.json({ error: "A subject and reason are required." }, { status: 400 });
    }
    const disputeId = await createDispute(user.id, String(subjectType), String(subjectId), String(reason));
    await audit(user.id, "dispute.created", "dispute", disputeId, {});
    return Response.json({ id: disputeId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
