import { getCurrentUser } from "../../../../../lib/server/current-user";
import { setTicketStatus, ticketWithMessages } from "../../../../../lib/server/support";
import { apiError, audit } from "../../../../../lib/server/trainora-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const { id: ticketId } = await context.params;
    const detail = await ticketWithMessages(ticketId);
    const isOwner = detail && (detail.ticket as { user_id: string }).user_id === user.id;
    if (!detail || (!isOwner && user.role !== "admin")) {
      return Response.json({ error: "Ticket not found." }, { status: 404 });
    }
    return Response.json(detail, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

const allowedStatuses = new Set(["open", "pending", "closed"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return Response.json({ error: "Admin access is required." }, { status: 403 });
    const { status } = await request.json() as { status?: string };
    if (!status || !allowedStatuses.has(status)) {
      return Response.json({ error: "Status must be open, pending, or closed." }, { status: 400 });
    }
    const { id: ticketId } = await context.params;
    await setTicketStatus(ticketId, status);
    await audit(user.email, "support_ticket.status_changed", "support_ticket", ticketId, { status });
    return Response.json({ status });
  } catch (error) {
    return apiError(error);
  }
}
