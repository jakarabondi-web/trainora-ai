"use client";

import { useEffect, useState } from "react";

type Payout = { id: string; trainer_name: string; amount_cents: number; status: string; requested_at: string };

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AdminEarningsManager() {
  const [available, setAvailable] = useState(0);
  const [pending, setPending] = useState(0);
  const [paid, setPaid] = useState(0);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/admin/earnings");
    if (response.status === 403) { setNotice("Administrator sign-in is required."); return; }
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Earnings are unavailable."); return; }
    setAvailable(payload.availableCents);
    setPending(payload.pendingCents);
    setPaid(payload.paidCents);
    setPayouts(payload.payouts ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function markPaid(id: string) {
    const response = await fetch(`/api/admin/payouts/${id}/mark-paid`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Could not mark this payout paid."); return; }
    setNotice("Payout marked paid.");
    await load();
  }

  return <>
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    <div className="roleKpis">
      <article><span>Available to trainers</span><b>{money(available)}</b></article>
      <article><span>Pending review</span><b>{money(pending)}</b></article>
      <article><span>Paid all-time</span><b>{money(paid)}</b></article>
    </div>
    <section className="applicantCommand">
      <header><div><h2>Payout requests</h2></div></header>
      {payouts.length ? payouts.map((payout) => <p key={payout.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid #edf1f4" }}>
        <span><b>{payout.trainer_name}</b> · {money(payout.amount_cents)} · {new Date(payout.requested_at).toLocaleDateString()}</span>
        <span>{payout.status === "processing" ? <button onClick={() => void markPaid(payout.id)}>Mark paid</button> : <em>{payout.status}</em>}</span>
      </p>) : <div className="adminEmpty"><b>No payout requests yet</b></div>}
    </section>
  </>;
}
