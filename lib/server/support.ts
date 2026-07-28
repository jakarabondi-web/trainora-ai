import { database, id, now } from "./trainora-store";

export async function listTickets(userId: string) {
  const db = database();
  const result = await db.prepare("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC").bind(userId).all();
  return result.results ?? [];
}

export async function createTicket(userId: string, subject: string, firstMessage: string) {
  const db = database();
  const ticketId = id("ticket");
  const timestamp = now();
  await db.batch([
    db.prepare("INSERT INTO support_tickets (id, user_id, subject, status, created_at, updated_at) VALUES (?, ?, ?, 'open', ?, ?)")
      .bind(ticketId, userId, subject, timestamp, timestamp),
    db.prepare("INSERT INTO support_messages (id, ticket_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id("msg"), ticketId, userId, firstMessage, timestamp),
  ]);
  return ticketId;
}

export async function ticketWithMessages(ticketId: string) {
  const db = database();
  const ticket = await db.prepare("SELECT * FROM support_tickets WHERE id = ?").bind(ticketId).first();
  if (!ticket) return null;
  const messages = await db.prepare("SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at").bind(ticketId).all();
  return { ticket, messages: messages.results ?? [] };
}

export async function setTicketStatus(ticketId: string, status: string) {
  const db = database();
  await db.prepare("UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, now(), ticketId).run();
}

export async function addMessage(ticketId: string, senderId: string, body: string) {
  const db = database();
  const timestamp = now();
  await db.batch([
    db.prepare("INSERT INTO support_messages (id, ticket_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id("msg"), ticketId, senderId, body, timestamp),
    db.prepare("UPDATE support_tickets SET updated_at = ? WHERE id = ?").bind(timestamp, ticketId),
  ]);
}

export async function listDisputes(userId?: string) {
  const db = database();
  const result = userId
    ? await db.prepare("SELECT * FROM disputes WHERE raised_by = ? ORDER BY created_at DESC").bind(userId).all()
    : await db.prepare("SELECT * FROM disputes ORDER BY created_at DESC").all();
  return result.results ?? [];
}

export async function createDispute(userId: string, subjectType: string, subjectId: string, reason: string) {
  const db = database();
  const disputeId = id("dispute");
  await db.prepare(
    "INSERT INTO disputes (id, raised_by, subject_type, subject_id, reason, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)",
  ).bind(disputeId, userId, subjectType, subjectId, reason, now()).run();
  return disputeId;
}

export async function resolveDispute(disputeId: string, resolution: string) {
  const db = database();
  await db.prepare("UPDATE disputes SET status = 'resolved', resolution = ?, resolved_at = ? WHERE id = ?")
    .bind(resolution, now(), disputeId).run();
}
