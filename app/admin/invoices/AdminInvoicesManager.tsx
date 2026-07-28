"use client";

import { FormEvent, useEffect, useState } from "react";

type Invoice = { id: string; organization_name: string; amount_cents: number; status: string; period_start: string; period_end: string };
type Organization = { id: string; name: string; spent_cents: number };

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AdminInvoicesManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [notice, setNotice] = useState("");

  async function load() {
    const [invoicesResponse, organizationsResponse] = await Promise.all([
      fetch("/api/admin/invoices"),
      fetch("/api/admin/organizations"),
    ]);
    if (invoicesResponse.status === 403) { setNotice("Administrator sign-in is required."); return; }
    const invoicesPayload = await invoicesResponse.json();
    const organizationsPayload = await organizationsResponse.json();
    if (!invoicesResponse.ok) { setNotice(invoicesPayload.error ?? "Invoices are unavailable."); return; }
    setInvoices(invoicesPayload.invoices ?? []);
    setOrganizations(organizationsPayload.organizations ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: form.get("organizationId"),
        amountCents: Math.round(Number(form.get("amount")) * 100),
        periodStart: form.get("periodStart"),
        periodEnd: form.get("periodEnd"),
      }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "The invoice could not be created."); return; }
    event.currentTarget.reset();
    setNotice("Invoice issued.");
    await load();
  }

  async function markPaid(id: string) {
    const response = await fetch(`/api/admin/invoices/${id}/mark-paid`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Could not mark this invoice paid."); return; }
    setNotice("Invoice marked paid.");
    await load();
  }

  return <>
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    <section className="applicantCommand">
      <header><div><h2>Issue an invoice</h2></div></header>
      <form onSubmit={createInvoice} className="jobFilters" style={{ flexWrap: "wrap", padding: 18 }}>
        <select name="organizationId" required>
          <option value="">Select organization…</option>
          {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name} ({money(organization.spent_cents)} spent)</option>)}
        </select>
        <input name="amount" type="number" min="0" step="0.01" placeholder="Amount ($)" required/>
        <input name="periodStart" type="date" required/>
        <input name="periodEnd" type="date" required/>
        <button type="submit">Issue invoice →</button>
      </form>
    </section>
    <section className="applicantCommand">
      <header><div><h2>Invoices</h2></div></header>
      {invoices.length ? invoices.map((invoice) => <p key={invoice.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid #edf1f4" }}>
        <span><b>{invoice.organization_name}</b> · {money(invoice.amount_cents)} · {invoice.period_start}–{invoice.period_end}</span>
        <span>{invoice.status !== "paid" ? <button onClick={() => void markPaid(invoice.id)}>Mark paid</button> : <em>paid</em>}</span>
      </p>) : <div className="adminEmpty"><b>No invoices yet</b></div>}
    </section>
  </>;
}
