"use client";

import { useEffect, useState } from "react";

type Dispute = { id: string; raised_by: string; subject_type: string; subject_id: string; reason: string; status: string; resolution: string | null; created_at: string };

export function AdminDisputesManager() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [notice, setNotice] = useState("");
  const [resolutions, setResolutions] = useState<Record<string, string>>({});

  async function load() {
    const response = await fetch("/api/disputes");
    if (response.status === 403) { setNotice("Administrator sign-in is required to view disputes."); return; }
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Disputes are unavailable."); return; }
    setDisputes(payload.disputes ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function resolve(id: string) {
    const resolution = resolutions[id];
    if (!resolution?.trim()) { setNotice("Write a resolution note before closing this dispute."); return; }
    const response = await fetch(`/api/admin/disputes/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "The dispute could not be resolved."); return; }
    setNotice("Dispute resolved.");
    await load();
  }

  const open = disputes.filter((dispute) => dispute.status === "open");
  const resolved = disputes.filter((dispute) => dispute.status === "resolved");

  return <section className="applicantCommand">
    <header><div><small>FINANCE / RESOLUTION</small><h2>Disputes</h2><p>Resolve trainer, client, and payment disputes with a written, auditable decision.</p></div><div className="commandStats"><span><b>{open.length}</b>Open</span><span><b>{resolved.length}</b>Resolved</span></div></header>
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    {open.length ? open.map((dispute) => <article key={dispute.id} style={{ padding: 16, borderBottom: "1px solid #edf1f4" }}>
      <b>{dispute.subject_type}</b> · {dispute.subject_id}
      <p>{dispute.reason}</p>
      <textarea placeholder="Resolution note" value={resolutions[dispute.id] ?? ""} onChange={(event) => setResolutions((current) => ({ ...current, [dispute.id]: event.target.value }))}/>
      <button onClick={() => void resolve(dispute.id)}>Resolve dispute →</button>
    </article>) : <div className="adminEmpty"><b>No open disputes</b><p>New trainer or client disputes will appear here.</p></div>}
    {resolved.length > 0 && <div style={{ marginTop: 20 }}>
      <h3>Resolved</h3>
      {resolved.map((dispute) => <p key={dispute.id}><b>{dispute.subject_type}</b> · {dispute.resolution}</p>)}
    </div>}
  </section>;
}
