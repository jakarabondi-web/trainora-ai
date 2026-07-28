import { getCurrentUser } from "../../../../../../lib/server/current-user";
import { addMessage, ticketWithMessages } from "../../../../../../lib/server/support";
import { apiError } from "../../../../../../lib/server/trainora-store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const { id: ticketId } = await context.params;
    const detail = await ticketWithMessages(ticketId);
    const isOwner = detail && (detail.ticket as { user_id: string }).user_id === user.id;
    if (!detail || (!isOwner && user.role !== "admin")) {
      return Response.json({ error: "Ticket not found." }, { status: 404 });
    }
    const { body } = await request.json() as { body?: string };
    if (!String(body ?? "").trim()) return Response.json({ error: "A message body is required." }, { status: 400 });
    await addMessage(ticketId, user.id, String(body));
    return Response.json({ posted: true }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
