"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardIcon } from "../components/DashboardIcon";

type Project = { id: string; title: string; description: string; discipline: string; status: string; budget_cents: number; spent_cents: number; required_quality_score: number; task_count: number; completed_count: number };
type Task = { id: string; title: string; instructions: string; rate_cents: number; status: string; trainer_name: string | null };
type Invoice = { id: string; amount_cents: number; status: string; period_start: string; period_end: string };

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ClientWorkspace() {
  const [state, setState] = useState<"loading" | "no_org" | "ready">("loading");
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<{ project: Project; tasks: Task[] } | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    const [projectsResponse, invoicesResponse] = await Promise.all([
      fetch("/api/client/projects"),
      fetch("/api/client/invoices"),
    ]);
    if (projectsResponse.status === 404) { setState("no_org"); return; }
    const projectsPayload = await projectsResponse.json();
    const invoicesPayload = await invoicesResponse.json();
    if (!projectsResponse.ok) { setNotice(projectsPayload.error ?? "Projects are unavailable."); return; }
    setProjects(projectsPayload.projects ?? []);
    setInvoices(invoicesPayload.invoices ?? []);
    setState("ready");
  }

  useEffect(() => { void load(); }, []);

  async function openProject(id: string) {
    const response = await fetch(`/api/client/projects/${id}`);
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Project could not be opened."); return; }
    setSelected(payload);
  }

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/client/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Project could not be created."); return; }
    event.currentTarget.reset();
    setNotice("Project created.");
    await load();
  }

  async function addTasks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const response = await fetch(`/api/client/projects/${selected.project.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, rateCents: Math.round(Number(body.rate) * 100) }),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Tasks could not be added."); return; }
    event.currentTarget.reset();
    setNotice(`${payload.created} task(s) added to the queue.`);
    await openProject(selected.project.id);
    await load();
  }

  if (state === "loading") return <div className="jobEmpty">Loading workspace…</div>;
  if (state === "no_org") return <div className="adminEmpty"><i><DashboardIcon name="client" size={22}/></i><b>No organization linked</b><p>Sign up as an AI company to create an organization and start posting projects.</p></div>;

  const totalBudget = projects.reduce((sum, project) => sum + project.budget_cents, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent_cents, 0);

  return <>
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    <div className="roleKpis">
      <article><span>Active projects</span><b>{projects.filter((p) => p.status === "active").length}</b><small>{projects.length} total</small></article>
      <article><span>Approved spend</span><b>{money(totalSpent)}</b><small>of {money(totalBudget)} budgeted</small></article>
      <article><span>Open invoices</span><b>{invoices.filter((i) => i.status !== "paid").length}</b><small>{invoices.length} total</small></article>
    </div>
    <div className="clientGrid">
      <section className="panel clientProjects" id="projects">
        <div className="panelHead"><div><small>PROJECT PORTFOLIO</small><h3>Delivery and quality</h3></div></div>
        {projects.length ? projects.map((project) => <article key={project.id}>
          <div><i>{project.title.split(" ").map((word) => word[0]).slice(0, 2).join("")}</i><p><b>{project.title}</b><span>{project.task_count} tasks</span></p></div>
          <div><span>Completion <b>{project.task_count ? Math.round((project.completed_count / project.task_count) * 100) : 0}%</b></span></div>
          <strong>{money(project.spent_cents)}<small>of {money(project.budget_cents)}</small></strong>
          <em>● {project.status}</em>
          <a href="#projects" onClick={(event) => { event.preventDefault(); void openProject(project.id); }}>Open →</a>
        </article>) : <div className="adminEmpty"><b>No projects yet</b><p>Create your first project to start assigning tasks to trainers.</p></div>}
        <form onSubmit={createProject} className="jobFilters" style={{ marginTop: 16, flexWrap: "wrap" }}>
          <input name="title" required placeholder="Project title"/>
          <input name="discipline" required placeholder="Discipline"/>
          <input name="budgetCents" type="number" min="0" placeholder="Budget (cents)"/>
          <input name="requiredQualityScore" type="number" min="0" max="100" placeholder="Quality gate %"/>
          <textarea name="description" required placeholder="Project description" style={{ width: "100%" }}/>
          <button type="submit">Create project →</button>
        </form>
      </section>
      <aside>
        {selected && <section className="panel">
          <small>PROJECT TASKS</small><h3>{selected.project.title}</h3>
          {selected.tasks.map((task) => <p key={task.id}><b>{task.title}</b><span> · {task.status}{task.trainer_name ? ` · ${task.trainer_name}` : ""}</span></p>)}
          <form onSubmit={addTasks} className="jobFilters" style={{ flexWrap: "wrap", marginTop: 12 }}>
            <input name="title" required placeholder="Task title"/>
            <input name="rate" type="number" min="0" step="0.01" placeholder="Rate ($)"/>
            <input name="count" type="number" min="1" defaultValue="1" placeholder="How many"/>
            <textarea name="instructions" required placeholder="Instructions for trainers" style={{ width: "100%" }}/>
            <button type="submit">Add tasks →</button>
          </form>
        </section>}
        <section className="panel budgetCard" id="billing">
          <div className="budgetRing"><span><b>{totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0}%</b><small>utilized</small></span></div>
          <p><b>{money(totalBudget - totalSpent)} remaining</b><span>Across active project budgets</span></p>
          {invoices.map((invoice) => <p key={invoice.id}><b>{money(invoice.amount_cents)}</b><span> · {invoice.status} · {invoice.period_start.slice(0, 10)}–{invoice.period_end.slice(0, 10)}</span></p>)}
        </section>
      </aside>
    </div>
  </>;
}
