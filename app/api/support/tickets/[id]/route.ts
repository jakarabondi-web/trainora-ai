import { getCurrentUser } from "../../../../../lib/server/current-user";
import { ticketWithMessages } from "../../../../../lib/server/support";
import { apiError } from "../../../../../lib/server/trainora-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const { id: ticketId } = await context.params;
    const detail = await ticketWithMessages(ticketId);
    if (!detail || (detail.ticket as { user_id: string }).user_id !== user.id) {
      return Response.json({ error: "Ticket not found." }, { status: 404 });
    }
    return Response.json(detail, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
