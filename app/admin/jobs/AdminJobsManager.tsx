"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardIcon } from "../../components/DashboardIcon";
import { JOB_CSV_TEMPLATE } from "../../../lib/job-import";
import type { JobSummary } from "../../../lib/trainora-types";

type Source = {
  id: string;
  name: string;
  provider: string;
  account_slug: string;
  status: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_count: number;
};

const sampleCsv = `${JOB_CSV_TEMPLATE}
Math Evaluation,Vector Labs,Mathematics,"Evaluate advanced reasoning responses","Graduate mathematics|95% calibration",8,14,task,10–15 hours,Remote,92,20`;

export function AdminJobsManager() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [csv, setCsv] = useState(sampleCsv);
  const [notice, setNotice] = useState("Ready to publish, import, or synchronize jobs.");
  const [busy, setBusy] = useState("");

  async function load() {
    const [jobsResponse, sourcesResponse] = await Promise.all([
      fetch("/api/admin/jobs"),
      fetch("/api/admin/job-sources"),
    ]);
    if (jobsResponse.status === 403 || sourcesResponse.status === 403) {
      setNotice("Administrator sign-in is required to manage job listings.");
      return;
    }
    if (!jobsResponse.ok || !sourcesResponse.ok) {
      setNotice("The jobs service is unavailable. Recheck the database connection.");
      return;
    }
    setJobs((await jobsResponse.json()).jobs ?? []);
    setSources((await sourcesResponse.json()).sources ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function submit(path: string, body: Record<string, unknown>, success: (payload: Record<string, unknown>) => string) {
    setBusy(path);
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json() as Record<string, unknown>;
    setNotice(response.ok ? success(payload) : String(payload.error ?? "The action failed."));
    if (response.ok) await load();
    setBusy("");
    return response.ok;
  }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await submit("/api/admin/jobs", {
      ...Object.fromEntries(form.entries()),
      requirements: String(form.get("requirements") ?? "").split("\n").filter(Boolean),
      status: "published",
    }, () => "Job published to the verified trainer marketplace.");
    if (ok) event.currentTarget.reset();
  }

  async function importCsv(event: FormEvent) {
    event.preventDefault();
    await submit("/api/admin/jobs/import", { csv }, (payload) => `${payload.imported} jobs imported and published.`);
  }

  async function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await submit("/api/admin/job-sources", Object.fromEntries(form.entries()), () => "Live source connected. Use Sync now to import its listings.");
    if (ok) event.currentTarget.reset();
  }

  async function syncSource(source: Source) {
    await submit(`/api/admin/job-sources/${source.id}/sync`, {}, (payload) => `${payload.imported} listings synchronized from ${source.name}.`);
  }

  return <div className="adminJobsWorkspace">
    <section className="adminActionBanner"><DashboardIcon name="jobs" size={22}/><div><b>Jobs operations are live</b><span>{notice}</span></div></section>

    <div className="jobControlGrid">
      <section className="controlPanel">
        <header><span><DashboardIcon name="jobs" size={20}/></span><div><small>MANUAL LISTING</small><h2>Publish one job</h2></div></header>
        <form onSubmit={createJob} className="jobManagerForm">
          <label>Job title<input name="title" required placeholder="Medical QA Evaluation"/></label>
          <div><label>Client<input name="clientName" required placeholder="Client organization"/></label><label>Discipline<input name="discipline" required placeholder="Medicine"/></label></div>
          <label>Description<textarea name="description" required placeholder="Describe the work, outputs, and quality expectations."/></label>
          <label>Requirements, one per line<textarea name="requirements" placeholder={"Verified professional credential\n90% quality score\nSafety assessment"}/></label>
          <div className="fourFields"><label>Minimum rate<input name="rateMin" type="number" min="0" step=".01" required/></label><label>Maximum rate<input name="rateMax" type="number" min="0" step=".01" required/></label><label>Per<select name="rateUnit"><option value="task">Task</option><option value="hour">Hour</option></select></label><label>Openings<input name="openings" type="number" min="1" defaultValue="10"/></label></div>
          <div><label>Quality threshold<input name="requiredQualityScore" type="number" min="1" max="100" defaultValue="90"/></label><label>Weekly hours<input name="hoursPerWeek" placeholder="10–15 hours"/></label></div>
          <button disabled={busy === "/api/admin/jobs"}><DashboardIcon name="jobs" size={17}/> {busy === "/api/admin/jobs" ? "Publishing…" : "Publish to eligible trainers"}</button>
        </form>
      </section>

      <section className="controlPanel">
        <header><span><DashboardIcon name="upload" size={20}/></span><div><small>BULK IMPORT</small><h2>Import jobs from CSV</h2></div></header>
        <form onSubmit={importCsv} className="csvImportForm">
          <p>Paste up to 200 jobs. Requirements use a vertical bar between items.</p>
          <textarea aria-label="Job CSV data" value={csv} onChange={(event) => setCsv(event.target.value)}/>
          <div><button disabled={busy === "/api/admin/jobs/import"}><DashboardIcon name="upload" size={17}/> {busy === "/api/admin/jobs/import" ? "Importing…" : "Validate and import"}</button><button type="button" className="secondary" onClick={() => setCsv(sampleCsv)}><DashboardIcon name="refresh" size={17}/> Reset example</button></div>
        </form>
      </section>
    </div>

    <section className="controlPanel liveSources">
      <header><span><DashboardIcon name="source" size={20}/></span><div><small>LIVE JOB API</small><h2>Connect Greenhouse or Lever</h2></div></header>
      <div className="sourceWorkspace">
        <form onSubmit={addSource} className="sourceForm">
          <label>Connection name<input name="name" required placeholder="Acme AI careers"/></label>
          <label>Provider<select name="provider"><option value="greenhouse">Greenhouse</option><option value="lever">Lever</option></select></label>
          <label>Board or site identifier<input name="accountSlug" required placeholder="acme-ai"/></label>
          <button disabled={busy === "/api/admin/job-sources"}><DashboardIcon name="integrations" size={17}/> Connect source</button>
          <p>Only public Greenhouse and Lever job APIs are supported. No private API keys are stored in this first release.</p>
        </form>
        <div className="sourceList">
          {sources.length ? sources.map((source) => <article key={source.id}>
            <span className="sourceProvider"><DashboardIcon name="source" size={18}/></span>
            <div><b>{source.name}</b><small>{source.provider} · {source.account_slug}</small></div>
            <p><b>{source.last_sync_count} jobs</b><small>{source.last_sync_at ? `Last sync ${new Date(source.last_sync_at).toLocaleString()}` : "Not synced yet"}</small></p>
            <button onClick={() => void syncSource(source)} disabled={busy.includes(source.id)}><DashboardIcon name="refresh" size={16}/>{busy.includes(source.id) ? "Syncing…" : "Sync now"}</button>
          </article>) : <div className="emptySource"><DashboardIcon name="integrations" size={30}/><b>No live sources connected</b><span>Add a public Greenhouse or Lever board to begin.</span></div>}
        </div>
      </div>
    </section>

    <section className="controlPanel publishedJobManager">
      <header><span><DashboardIcon name="database" size={20}/></span><div><small>LIVE DATABASE</small><h2>Published jobs</h2></div><strong>{jobs.filter((job) => job.status === "published").length} live</strong></header>
      <div className="publishedJobTable">
        <div><b>Job</b><b>Client</b><b>Quality gate</b><b>Openings</b><b>Status</b></div>
        {jobs.map((job) => <article key={job.id}><span><b>{job.title}</b><small>{job.discipline} · {job.location}</small></span><span>{job.clientName}</span><span>≥ {job.requiredQualityScore}%</span><span>{job.openings}</span><em>{job.status}</em></article>)}
      </div>
    </section>
  </div>;
}
