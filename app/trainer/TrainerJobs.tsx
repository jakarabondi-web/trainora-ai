"use client";

import { useEffect, useMemo, useState } from "react";
import type { JobSummary } from "../../lib/trainora-types";

export function TrainerJobs() {
  const [jobs,setJobs]=useState<JobSummary[]>([]);
  const [query,setQuery]=useState("");
  const [discipline,setDiscipline]=useState("All disciplines");
  const [selected,setSelected]=useState<JobSummary|null>(null);
  const [notice,setNotice]=useState("");
  const [loading,setLoading]=useState(true);

  async function loadJobs(){
    setLoading(true);
    try{
      const response=await fetch("/api/jobs");
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error??"Jobs are unavailable.");
      setJobs(payload.jobs??[]);
    }catch(error){setNotice(error instanceof Error?error.message:"Jobs are unavailable.")}
    finally{setLoading(false)}
  }

  useEffect(()=>{void loadJobs()},[]);
  const disciplines=["All disciplines",...Array.from(new Set(jobs.map(job=>job.discipline)))];
  const filtered=useMemo(()=>jobs.filter(job=>(discipline==="All disciplines"||job.discipline===discipline)&&`${job.title} ${job.clientName} ${job.discipline}`.toLowerCase().includes(query.toLowerCase())),[jobs,query,discipline]);

  async function apply(job:JobSummary){
    setNotice("");
    const response=await fetch(`/api/jobs/${job.id}/apply`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({coverNote:"I confirm my availability and agree to the project quality requirements."})});
    const payload=await response.json();
    if(!response.ok){setNotice(payload.error??"Application could not be submitted.");return}
    setNotice(`Application submitted. Match score: ${payload.matchScore}%.`);
    setSelected(null);await loadJobs();
  }

  return <section className="trainerJobsBoard" id="jobs">
    <header><div><small>VERIFIED OPPORTUNITIES</small><h2>Jobs marketplace</h2><p>Browse paid projects matched to your approved expertise, verification level, and current quality score.</p></div><a href="#application-status">My eligibility →</a></header>
    {notice&&<div className="jobNotice">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
    <div className="jobFilters"><label>⌕<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search jobs, clients, or disciplines"/></label><select value={discipline} onChange={event=>setDiscipline(event.target.value)}>{disciplines.map(value=><option key={value}>{value}</option>)}</select><button onClick={()=>{setQuery("");setDiscipline("All disciplines")}}>Clear filters</button></div>
    <div className="jobBoardLayout">
      <div className="jobsList">
        <div className="jobsListHead"><span>{filtered.length} opportunities</span><em>Quality-gated access</em></div>
        {loading?<div className="jobEmpty">Loading verified jobs…</div>:filtered.length?filtered.map(job=><button className={selected?.id===job.id?"selected":""} key={job.id} onClick={()=>setSelected(job)}>
          <i>◎</i><div><b>{job.title}</b><span>{job.clientName} · {job.discipline} · {job.location}</span><small>{job.description}</small><p>{job.requirements.slice(0,2).map(requirement=><em key={requirement}>{requirement}</em>)}</p></div><aside><strong>${job.rateMin}–${job.rateMax}</strong><span>per {job.rateUnit}</span><em>{job.hoursPerWeek}</em>{job.applicationStatus&&<b>{job.applicationStatus}</b>}</aside>
        </button>):<div className="jobEmpty">No jobs match these filters.</div>}
      </div>
      <div className="jobDetail">
        {selected?<><header><i>◎</i><div><small>{selected.clientName}</small><h3>{selected.title}</h3><p>{selected.discipline} · {selected.location}</p></div></header><div className="jobDetailStats"><span><small>Rate</small><b>${selected.rateMin}–${selected.rateMax}/{selected.rateUnit}</b></span><span><small>Time</small><b>{selected.hoursPerWeek||"Flexible"}</b></span><span><small>Openings</small><b>{selected.openings}</b></span><span><small>Quality gate</small><b>≥ {selected.requiredQualityScore}%</b></span></div><section><h4>Project scope</h4><p>{selected.description}</p></section><section><h4>Eligibility requirements</h4>{selected.requirements.map(requirement=><p className="jobRequirement" key={requirement}>✓ {requirement}</p>)}</section><div className="jobApplyRule"><b>Before you apply</b><p>Your identity, credentials, approval status, and quality score are checked automatically. Applications that do not meet a mandatory gate are not submitted.</p></div><button className="jobApplyButton" disabled={Boolean(selected.applicationStatus)} onClick={()=>void apply(selected)}>{selected.applicationStatus?`Application ${selected.applicationStatus}`:"Apply for this job →"}</button></>:<div className="selectJob"><i>▦</i><h3>Select a job</h3><p>Open an opportunity to see its scope, requirements, quality threshold, rate, and application status.</p></div>}
      </div>
    </div>
  </section>
}

