"use client";

import { useEffect, useState } from "react";
import { DashboardIcon } from "../components/DashboardIcon";

type QueueItem = { id: string; task_title: string; project_title: string; trainer_name: string; content: string; rate_cents: number; submitted_at: string };

export function ReviewerWorkspace() {
  const [state, setState] = useState<"loading" | "forbidden" | "ready">("loading");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/reviewer/queue");
    if (response.status === 403) { setState("forbidden"); return; }
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "The review queue is unavailable."); return; }
    setQueue(payload.queue ?? []);
    setSelected((current) => current ? payload.queue.find((item: QueueItem) => item.id === current.id) ?? null : null);
    setState("ready");
  }

  useEffect(() => { void load(); }, []);

  async function decide(decision: "approved" | "rejected") {
    if (!selected) return;
    if (decision === "rejected" && !notes.trim()) { setNotice("Written feedback is required to request a revision."); return; }
    const response = await fetch(`/api/reviewer/submissions/${selected.id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, notes }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "The decision could not be recorded."); return; }
    setNotice(decision === "approved" ? "Submission approved and the trainer was paid." : "Revision requested.");
    setSelected(null);
    setNotes("");
    await load();
  }

  if (state === "loading") return <div className="jobEmpty">Loading review queue…</div>;
  if (state === "forbidden") return <div className="adminEmpty"><i><DashboardIcon name="reviewer" size={22}/></i><b>Reviewer access required</b><p>Sign in with a reviewer or admin account to open the review queue.</p></div>;

  return <>
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    <div className="roleKpis"><article><span>Queue</span><b>{queue.length}</b><small>Pending submissions</small></article></div>
    <div className="reviewLayout">
      <section className="panel reviewQueue" id="review-queue">
        <div className="panelHead"><div><small>PRIORITIZED QUEUE</small><h3>Submissions</h3></div></div>
        {queue.length ? queue.map((item, index) => <article key={item.id}>
          <i>{index + 1}</i>
          <p><span>{item.project_title}</span><b>{item.task_title}</b><small>{item.trainer_name} · ${(item.rate_cents / 100).toFixed(2)}</small></p>
          <a href="#review-queue" onClick={(event) => { event.preventDefault(); setSelected(item); setNotes(""); }}>Open review →</a>
        </article>) : <div className="adminEmpty"><b>Queue is empty</b><p>Trainer submissions will appear here as they are sent for review.</p></div>}
      </section>
      <aside>
        {selected ? <section className="panel">
          <small>REVIEWING</small><h3>{selected.task_title}</h3>
          <p>{selected.trainer_name} · {selected.project_title}</p>
          <div className="trainerOpsBody"><strong>Submission</strong><p>{selected.content}</p></div>
          <textarea placeholder="Feedback for the trainer (required to request a revision)" value={notes} onChange={(event) => setNotes(event.target.value)}/>
          <div className="decisionActions">
            <button className="approve" onClick={() => void decide("approved")}>Approve & pay</button>
            <button className="reject" onClick={() => void decide("rejected")}>Request revision</button>
          </div>
        </section> : <div className="reviewPlaceholder"><i>◇</i><h3>Select a submission</h3><p>Choose an item from the queue to review its content and decide.</p></div>}
      </aside>
    </div>
  </>;
}
