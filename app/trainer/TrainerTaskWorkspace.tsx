"use client";

import { useEffect, useState } from "react";

type OpenTask = { id: string; title: string; project_title: string; discipline: string; rate_cents: number };
type MyTask = { id: string; title: string; project_title: string; status: string; submission_status: string | null; review_notes: string | null };

export function TrainerTaskWorkspace() {
  const [eligible, setEligible] = useState(true);
  const [openTasks, setOpenTasks] = useState<OpenTask[]>([]);
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [notice, setNotice] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  async function load() {
    try {
      const response = await fetch("/api/trainer/tasks");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Tasks are unavailable.");
      setEligible(payload.eligible);
      setOpenTasks(payload.openTasks ?? []);
      setMyTasks(payload.myTasks ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tasks are unavailable.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function claim(taskId: string) {
    const response = await fetch(`/api/trainer/tasks/${taskId}/claim`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Could not claim this task."); return; }
    setNotice("Task claimed. Complete it in your active tasks list.");
    await load();
  }

  async function submit(taskId: string) {
    const content = drafts[taskId];
    if (!content?.trim()) { setNotice("Write your submission before sending it."); return; }
    const response = await fetch(`/api/trainer/tasks/${taskId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Could not submit this task."); return; }
    setNotice("Submission sent for review.");
    await load();
  }

  return <section className="trainerJobsBoard" id="task-workspace">
    <header><div><small>TASK WORKSPACE</small><h2>Claim and complete work</h2><p>Claim an open task, submit your work, and get paid automatically once a reviewer approves it.</p></div></header>
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    {!eligible && <div className="jobNotice">Approved trainer status is required before you can claim tasks. Finish your application first.</div>}
    <div className="jobBoardLayout">
      <div className="jobsList">
        <div className="jobsListHead"><span>{openTasks.length} open tasks</span></div>
        {openTasks.length ? openTasks.map((task) => <article key={task.id} className="jobEmpty" style={{ textAlign: "left", display: "block", padding: 14 }}>
          <b>{task.title}</b><span> · {task.project_title} · {task.discipline}</span>
          <p>${(task.rate_cents / 100).toFixed(2)} per task</p>
          <button disabled={!eligible} onClick={() => void claim(task.id)}>Claim task →</button>
        </article>) : <div className="jobEmpty">No open tasks right now.</div>}
      </div>
      <div className="jobDetail">
        <h3>My active tasks</h3>
        {myTasks.length ? myTasks.map((task) => <article key={task.id} style={{ marginBottom: 16 }}>
          <b>{task.title}</b><span> · {task.project_title} · {task.status}</span>
          {task.review_notes && <p><em>Reviewer note: {task.review_notes}</em></p>}
          {task.status === "assigned" && <>
            <textarea placeholder="Write your submission…" value={drafts[task.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [task.id]: event.target.value }))}/>
            <button onClick={() => void submit(task.id)}>Submit work →</button>
          </>}
        </article>) : <p>No claimed tasks yet.</p>}
      </div>
    </div>
  </section>;
}
