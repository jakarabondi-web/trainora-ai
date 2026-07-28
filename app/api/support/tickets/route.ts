import { getCurrentUser } from "../../../../lib/server/current-user";
import { createTicket, listTickets } from "../../../../lib/server/support";
import { apiError, audit } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    return Response.json({ tickets: await listTickets(user.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const { subject, message } = await request.json() as { subject?: string; message?: string };
    if (!String(subject ?? "").trim() || !String(message ?? "").trim()) {
      return Response.json({ error: "A subject and message are required." }, { status: 400 });
    }
    const ticketId = await createTicket(user.id, String(subject), String(message));
    await audit(user.id, "support_ticket.created", "support_ticket", ticketId, {});
    return Response.json({ id: ticketId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
