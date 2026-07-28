"use client";

import { FormEvent, useEffect, useState } from "react";

type Earning = { id: string; description: string; amount_cents: number; status: string; created_at: string };
type PayoutMethod = { id: string; label: string; type: string; is_default: number };
type Payout = { id: string; amount_cents: number; status: string; requested_at: string };
type Summary = { availableCents: number; pendingCents: number; paidCents: number; weekCents: number; earnings: Earning[]; payoutMethods: PayoutMethod[]; payouts: Payout[] };

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function TrainerEarnings() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [notice, setNotice] = useState("");
  const [amount, setAmount] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/trainer/earnings");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Earnings are unavailable.");
      setSummary(payload);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Earnings are unavailable.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function addMethod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/trainer/payout-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: form.get("label"), accountLast4: form.get("accountLast4"), isDefault: true }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Payout method could not be added."); return; }
    event.currentTarget.reset();
    setNotice("Payout method added.");
    await load();
  }

  async function requestPayout() {
    if (!summary?.payoutMethods.length) { setNotice("Add a payout method first."); return; }
    const methodId = summary.payoutMethods[0].id;
    const amountCents = Math.round(Number(amount) * 100);
    const response = await fetch("/api/trainer/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ methodId, amountCents }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Payout could not be requested."); return; }
    setNotice("Payout requested.");
    setAmount("");
    await load();
  }

  if (!summary) return <section className="guideKpis five" id="earnings">{notice && <div className="jobNotice">{notice}</div>}</section>;

  return <>
    <div className="guideKpis five" id="earnings">
      <GuideKpiT label="Available balance" value={money(summary.availableCents)} note="Ready for payout"/>
      <GuideKpiT label="Pending review" value={money(summary.pendingCents)} note="Awaiting approval"/>
      <GuideKpiT label="Paid to date" value={money(summary.paidCents)} note="All-time"/>
      <GuideKpiT label="This week" value={money(summary.weekCents)} note="Paid earnings"/>
    </div>
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    <article className="guideCard" id="payments">
      <header><h3>Earnings history</h3></header>
      <div className="trainerOpsList">
        {summary.earnings.length ? summary.earnings.map((earning) => <p key={earning.id}>
          <span><b>{earning.description}</b><small>{new Date(earning.created_at).toLocaleDateString()}</small></span>
          <strong>{money(earning.amount_cents)}</strong><em>{earning.status}</em>
        </p>) : <p>No earnings yet. Complete and get a task approved to start earning.</p>}
      </div>
    </article>
    <article className="guideCard" id="payout-methods">
      <header><h3>Payout methods</h3></header>
      <div className="trainerOpsBody">
        {summary.payoutMethods.length ? summary.payoutMethods.map((method) => <p key={method.id}><b>{method.label}</b> · {method.type}{method.is_default ? " · default" : ""}</p>) : <p>No payout method on file.</p>}
      </div>
      <form onSubmit={addMethod} className="jobFilters">
        <input name="label" required placeholder="Bank account •••• 4921"/>
        <input name="accountLast4" placeholder="Last 4 digits" maxLength={4}/>
        <button type="submit">Add payout method</button>
      </form>
      <div className="jobFilters">
        <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="0.01" placeholder="Amount to withdraw"/>
        <button type="button" onClick={requestPayout}>Request payout</button>
      </div>
      <div className="trainerOpsList">
        {summary.payouts.map((payout) => <p key={payout.id}><span><b>Payout</b><small>{new Date(payout.requested_at).toLocaleDateString()}</small></span><strong>{money(payout.amount_cents)}</strong><em>{payout.status}</em></p>)}
      </div>
    </article>
  </>;
}

function GuideKpiT({ label, value, note }: { label: string; value: string; note: string }) {
  return <article><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}
