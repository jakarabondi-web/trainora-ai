"use client";

import { useEffect, useState } from "react";

type TicketRow = { id: string; subject: string; status: string; user_name: string; user_email: string; updated_at: string };
type Message = { id: string; sender_id: string; body: string; created_at: string };

export function AdminTicketsManager() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selected, setSelected] = useState<TicketRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/admin/tickets");
    if (response.status === 403) { setNotice("Administrator sign-in is required to view tickets."); return; }
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Tickets are unavailable."); return; }
    setTickets(payload.tickets ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function open(ticket: TicketRow) {
    setSelected(ticket);
    const response = await fetch(`/api/support/tickets/${ticket.id}`);
    const payload = await response.json();
    if (response.ok) setMessages(payload.messages ?? []);
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    const response = await fetch(`/api/support/tickets/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "The reply could not be sent."); return; }
    setReply("");
    await open(selected);
  }

  async function setStatus(status: string) {
    if (!selected) return;
    const response = await fetch(`/api/support/tickets/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Status could not be updated."); return; }
    setNotice(`Ticket marked ${status}.`);
    await load();
    setSelected((current) => current ? { ...current, status } : current);
  }

  return <section className="applicantWorkspace">
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    <div className="applicantQueue">
      <div className="queueHeader"><b>Ticket</b><b>Status</b></div>
      {tickets.length ? tickets.map((ticket) => <button className={selected?.id === ticket.id ? "selected" : ""} key={ticket.id} onClick={() => void open(ticket)}>
        <span><p><b>{ticket.subject}</b><small>{ticket.user_name} · {ticket.user_email}</small></p></span>
        <em data-status={ticket.status}>{ticket.status}</em>
      </button>) : <div className="adminEmpty"><b>No support tickets</b><p>Trainer and client tickets will appear here.</p></div>}
    </div>
    <div className="reviewConsole">
      {selected ? <>
        <header><div><h3>{selected.subject}</h3><p>{selected.user_name} · {selected.user_email}</p></div><em>{selected.status}</em></header>
        <div className="trainerOpsList">
          {messages.map((message) => <p key={message.id}>{message.body}</p>)}
        </div>
        <textarea placeholder="Write a reply…" value={reply} onChange={(event) => setReply(event.target.value)}/>
        <div className="decisionActions">
          <button onClick={() => void sendReply()}>Send reply</button>
          <button onClick={() => void setStatus("closed")}>Close ticket</button>
          <button onClick={() => void setStatus("open")}>Reopen</button>
        </div>
      </> : <div className="reviewPlaceholder"><i>◇</i><h3>Select a ticket</h3><p>Choose a ticket to read the thread and reply.</p></div>}
    </div>
  </section>;
}
