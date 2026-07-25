"use client";

import { FormEvent, useEffect, useState } from "react";
import type { PlatformAnalytics } from "../../lib/platform-data";
import type { ApplicantSummary, JobSummary } from "../../lib/trainora-types";

type CapabilityGroup = {group:string;tools:string[]};
type AdminNavItem = [string, string, string];
type JobApplicationRow={id:string;status:string;match_score:number;applied_at:string;cover_note:string;job_title:string;trainer_name:string;trainer_email:string;quality_score:number};
type OperationsAnalytics={trainers:{total:number};applicants:{total:number;in_review:number;approved:number;average_quality:number};jobs:{total:number;published:number};jobApplications:{total:number;pending:number;assigned:number};assessments:{total:number;passed:number;average_score:number};verification:{total:number;pending:number;failed:number}};

const adminNav: [string, AdminNavItem[]][] = [
  ["OVERVIEW",[["Overview","▣","#overview"]]],
  ["USERS",[["Applicants","♙","#applicants"],["Trainers","♙","#trainers"],["Clients","♧","#projects"],["Reviewers","◎","#status"]]],
  ["PROJECTS",[["Jobs","▦","#job-admin"],["All Projects","▦","#projects"],["Tasks","▤","#trend"],["Reviews","◫","#status"]]],
  ["QUALITY",[["Quality Dashboard","◇","#quality"],["Assessments","◌","#assessment-admin"],["Gold Tasks","◆","#quality"],["Calibration","◉","#quality"]]],
  ["PAYMENTS",[["Earnings","$","#overview"],["Invoices","▤","#overview"],["Disputes","◎","#pending"]]],
  ["SUPPORT",[["Tickets","◇","#pending"],["Alerts","△","#alerts"]]],
  ["SYSTEM",[["Audit Logs","▥","#alerts"],["Fraud Detection","◇","#alerts"],["Settings","⚙","#platform"]]],
];

export function AdminDashboard({analytics}:{analytics:PlatformAnalytics;capabilityGroups:CapabilityGroup[]}) {
  const [notice,setNotice]=useState("");
  const [activeItem,setActiveItem]=useState("Overview");
  const [applicants,setApplicants]=useState<ApplicantSummary[]>([]);
  const [jobs,setJobs]=useState<JobSummary[]>([]);
  const [jobApplications,setJobApplications]=useState<JobApplicationRow[]>([]);
  const [selectedApplicant,setSelectedApplicant]=useState<ApplicantSummary|null>(null);
  const [backendState,setBackendState]=useState<"loading"|"connected"|"needs_config"|"auth_required">("loading");
  const [operations,setOperations]=useState<OperationsAnalytics|null>(null);
  const m=analytics.metrics;

  async function loadOperationalData() {
    try {
      const [applicantResponse,jobResponse,jobApplicationResponse,analyticsResponse]=await Promise.all([fetch("/api/admin/applicants"),fetch("/api/admin/jobs"),fetch("/api/admin/job-applications"),fetch("/api/admin/operations-analytics")]);
      if (applicantResponse.status===403||jobResponse.status===403||jobApplicationResponse.status===403||analyticsResponse.status===403){setBackendState("auth_required");return}
      if (!applicantResponse.ok||!jobResponse.ok||!jobApplicationResponse.ok||!analyticsResponse.ok){setBackendState("needs_config");return}
      const [applicantPayload,jobPayload,jobApplicationPayload,analyticsPayload]=await Promise.all([applicantResponse.json(),jobResponse.json(),jobApplicationResponse.json(),analyticsResponse.json()]);
      setApplicants(applicantPayload.applicants??[]);
      setJobs(jobPayload.jobs??[]);
      setJobApplications(jobApplicationPayload.applications??[]);
      setOperations(analyticsPayload);
      setSelectedApplicant(current=>current?applicantPayload.applicants.find((item:ApplicantSummary)=>item.id===current.id)??null:null);
      setBackendState("connected");
    } catch {setBackendState("needs_config")}
  }

  useEffect(()=>{void loadOperationalData()},[]);

  async function applicantAction(path:string,body:Record<string,unknown>,success:string){
    const response=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const payload=await response.json();
    if(!response.ok){setNotice(payload.error??"The review action failed.");return}
    setNotice(success);await loadOperationalData();
  }

  async function createJob(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const response=await fetch("/api/admin/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      ...Object.fromEntries(form.entries()),
      requirements:String(form.get("requirements")??"").split("\n").filter(Boolean),
      status:"published",
    })});
    const payload=await response.json();
    if(!response.ok){setNotice(payload.error??"The job could not be published.");return}
    event.currentTarget.reset();setNotice("Job published to eligible trainers.");await loadOperationalData();
  }

  async function createAssessment(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const response=await fetch("/api/admin/assessments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(form.entries()))});
    const payload=await response.json();
    if(!response.ok){setNotice(payload.error??"Assessment could not be created.");return}
    setNotice("New assessment version activated. Existing attempts retain their original version.");
  }

  return <main className="guidePortal">
    <GuideSidebar nav={adminNav} activeItem={activeItem} onSelect={(href,label)=>{setActiveItem(label);setNotice(`${label} section opened.`)}}/>
    <section className="guideMain">
      <GuideTopbar name="Alex Morgan" role="Super Admin"/>
      <div className="guideCanvas">
        <header className="guidePageHead"><div><h1>Admin Overview</h1><p>Welcome back, Alex. Here’s what’s happening on Trainora AI today.</p></div><button>May 12 – May 18, 2025⌄</button></header>
        {notice&&<div className="guideNotice">✓ {notice}<button onClick={()=>setNotice("")}>×</button></div>}
        <div className="guideKpis five" id="overview">
          <GuideKpi label="Approved Trainers" value={operations?String(operations.trainers.total):"12,847"} note={operations?"Live approved accounts":"+12.4% from last week"}/>
          <GuideKpi label="Published Jobs" value={operations?String(operations.jobs.published):"128"} note={operations?"Live job records":"+8.2% from last week"}/>
          <GuideKpi label="Applicants in Review" value={operations?String(operations.applicants.in_review):"132"} note={operations?"Requires human decision":"Requires review"}/>
          <GuideKpi label="Applicant Quality" value={operations?`${Number(operations.applicants.average_quality||0).toFixed(1)}%`:`${m.reviewAgreement}%`} note={operations?"Average submitted score":"+2.1% from last week"}/>
          <GuideKpi label="Verification Alerts" value={operations?String(Number(operations.verification.pending||0)+Number(operations.verification.failed||0)):"16"} note={operations?"Pending or failed checks":"Needs investigation"}/>
        </div>

        <section className="operationsStatus" data-state={backendState}>
          <div><i>{backendState==="connected"?"✓":backendState==="loading"?"…":"!"}</i><p><b>{backendState==="connected"?"Operational backend connected":backendState==="auth_required"?"Administrator sign-in required":backendState==="loading"?"Checking operational services":"Production services need configuration"}</b><span>{backendState==="connected"?"Application, verification, assessment, jobs, notification, and audit records are live.":backendState==="auth_required"?"Sign in with an email listed in the administrator allowlist to review private applicant evidence.":"The dashboard remains visible, but protected actions will not run until database, storage, and administrator access are connected."}</span></p></div>
          <button onClick={()=>void loadOperationalData()}>Recheck services</button>
        </section>

        <section className="applicantCommand" id="applicants">
          <header><div><small>APPLICANT QUALITY CONTROL</small><h2>Approval command center</h2><p>Review evidence gate by gate. Approval remains locked until mandatory verification and assessment checks pass.</p></div><div className="commandStats"><span><b>{applicants.length}</b>Total</span><span><b>{applicants.filter(a=>a.applicationStatus==="under_review").length}</b>In review</span><span><b>{applicants.filter(a=>a.riskScore>=30).length}</b>Risk flags</span></div></header>
          <div className="applicantWorkspace">
            <div className="applicantQueue">
              <div className="queueHeader"><b>Applicant</b><b>Stage</b><b>Quality</b><b>Risk</b></div>
              {applicants.length?applicants.map(applicant=><button className={selectedApplicant?.id===applicant.id?"selected":""} key={applicant.id} onClick={()=>setSelectedApplicant(applicant)}>
                <span><i>{applicant.fullName.split(" ").map(part=>part[0]).join("").slice(0,2)}</i><p><b>{applicant.fullName}</b><small>{applicant.discipline} · {applicant.country}</small></p></span>
                <em data-status={applicant.applicationStatus}>{applicant.currentStage.replaceAll("_"," ")}</em>
                <strong>{applicant.qualityScore||"—"}{applicant.qualityScore?"%":""}</strong>
                <strong className={applicant.riskScore>=30?"riskHigh":""}>{applicant.riskScore}%</strong>
              </button>):<div className="adminEmpty"><i>◎</i><b>No applications yet</b><p>New expert applications will enter this queue after submission.</p></div>}
            </div>
            <div className="reviewConsole">
              {selectedApplicant?<>
                <header><div><small>RESTRICTED REVIEW</small><h3>{selectedApplicant.fullName}</h3><p>{selectedApplicant.email} · {selectedApplicant.yearsExperience} years experience</p></div><em data-status={selectedApplicant.applicationStatus}>{selectedApplicant.applicationStatus.replaceAll("_"," ")}</em></header>
                <div className="qualityGateList">
                  <QualityGate label="Email ownership" status={selectedApplicant.emailVerified?"passed":"pending"} detail={selectedApplicant.emailVerified?"Verified address":"Verification outstanding"}/>
                  <QualityGate label="Account integrity" status={checkStatus(selectedApplicant,"email_domain_risk","duplicate_account")} detail="Disposable email, duplicate account, and baseline fraud rules"/>
                  <QualityGate label="Government ID" status={checkStatus(selectedApplicant,"government_id","identity_bundle")} detail="Authenticity, expiry, name, and document-risk review"/>
                  <QualityGate label="Selfie & liveness" status={checkStatus(selectedApplicant,"selfie_liveness","identity_bundle")} detail="Face similarity and presentation-attack check"/>
                  <QualityGate label="Credentials" status={checkStatus(selectedApplicant,"credential")} detail="Education, license, employment, and portfolio evidence"/>
                  <QualityGate label="Pre-screen assessment" status={selectedApplicant.assessment?.passed?"passed":selectedApplicant.assessment?.status==="submitted"?"failed":"pending"} detail={selectedApplicant.assessment?`${selectedApplicant.assessment.score??"—"}% quality · ${selectedApplicant.assessment.integrityScore??"—"}% integrity`:"Not assigned"}/>
                </div>
                <div className="evidenceFiles"><b>Protected evidence</b>{selectedApplicant.documents.length?selectedApplicant.documents.map(document=><a key={document.id} href={`/api/admin/documents/${document.id}`} target="_blank" rel="noreferrer"><i>▤</i><span>{document.kind.replaceAll("_"," ")}<small>{document.filename}</small></span><em>Review ↗</em></a>):<p>No evidence files have been uploaded.</p>}</div>
                <div className="verificationActions">
                  <b>Record reviewed evidence</b>
                  <div>
                    <button onClick={()=>applicantAction(`/api/admin/applicants/${selectedApplicant.id}/verification`,{type:"government_id",status:"passed",score:100,reason:"Document reviewed by authorized administrator."},"Government ID marked as passed.")}>Pass government ID</button>
                    <button onClick={()=>applicantAction(`/api/admin/applicants/${selectedApplicant.id}/verification`,{type:"selfie_liveness",status:"passed",score:100,reason:"Selfie comparison and liveness reviewed."},"Selfie and liveness marked as passed.")}>Pass selfie & liveness</button>
                    <button onClick={()=>applicantAction(`/api/admin/applicants/${selectedApplicant.id}/verification`,{type:"credential",status:"passed",score:100,reason:"Professional evidence validated."},"Credentials marked as passed.")}>Pass credentials</button>
                  </div>
                </div>
                <div className="decisionActions">
                  <button className="approve" onClick={()=>applicantAction(`/api/admin/applicants/${selectedApplicant.id}/decision`,{decision:"approved",notes:"All mandatory gates passed and evidence manually reviewed."},"Applicant approved and listed as an eligible trainer.")}>Approve trainer</button>
                  <button onClick={()=>applicantAction(`/api/admin/applicants/${selectedApplicant.id}/decision`,{decision:"action_required",notes:"Additional evidence is required before a decision."},"Applicant asked for more evidence.")}>Request evidence</button>
                  <button onClick={()=>applicantAction(`/api/admin/applicants/${selectedApplicant.id}/decision`,{decision:"waitlisted",notes:"Meets baseline requirements; awaiting project demand."},"Applicant moved to waitlist.")}>Waitlist</button>
                  <button className="reject" onClick={()=>applicantAction(`/api/admin/applicants/${selectedApplicant.id}/decision`,{decision:"rejected",notes:"Mandatory quality requirements were not met after review."},"Applicant rejected with an auditable reason.")}>Reject</button>
                </div>
              </>:<div className="reviewPlaceholder"><i>◇</i><h3>Select an applicant</h3><p>The complete evidence packet, quality gates, risk signals, and decision controls will appear here.</p></div>}
            </div>
          </div>
        </section>

        <div className="guideTwoCol chartRow" id="trend">
          <GuideCard title="Task Completion Trend">
            <div className="chartMeta"><div className="chartLegend"><span><i/>Completed</span><span><i className="soft"/>Reviewed</span></div><p><b>32,841</b><span>+17.1% this week</span></p></div>
            <LineChart primary={[22,31,27,38,42,36,34,45,54,58,51,49,44,55,67]} secondary={[13,18,15,25,29,24,22,31,36,39,33,32,29,37,44]} labels={["May 12","May 13","May 14","May 15","May 16","May 17","May 18"]}/>
          </GuideCard>
          <GuideCard title="Tasks by Status" id="status">
            <div className="donutWrap"><div className="guideDonut"><span><small>Total</small><b>42,782</b></span></div><div className="donutLegend">{[["In Progress","18,500 (43%)","dark"],["Under Review","12,350 (29%)","mid"],["Revision","6,482 (15%)","amber"],["Approved","5,300 (13%)","pale"]].map(([a,b,c])=><p key={a}><i className={c}/><span>{a}</span><b>{b}</b></p>)}</div></div>
          </GuideCard>
        </div>

        <div className="guideThreeCol">
          <GuideListCard title="Recent Projects" action="View all projects" id="projects" rows={[
            ["Financial Research Eval","Vector Labs","75%","18,340 / 24,000"],
            ["Code Generation Benchmark","Helix AI","62%","12,431 / 20,000"],
            ["Legal Reasoning Dataset","Nexora","40%","8,100 / 20,000"],
            ["Multilingual SFT Data","Luminova","66%","11,034 / 20,000"],
            ["Medical QA Evaluation","Cinder Research","70%","14,060 / 20,000"],
          ]}/>
          <GuideListCard title="Pending Items" action="View all pending" id="pending" rows={[
            ["Trainer applications","132","Requires review",""],
            ["Tasks awaiting review","1,342","Across 43 projects",""],
            ["Disputes open","27","Requires attention",""],
            ["Failed quality checks","16","Needs investigation",""],
            ["Payment failures","12","Requires follow-up",""],
          ]}/>
          <GuideListCard title="System Alerts" action="View all alerts" id="alerts" alert rows={[
            ["High rejection rate detected","Project: Code Generation Benchmark","",""],
            ["Unusual task speed detected","User: 7 trainers flagged","",""],
            ["Storage usage high","80% of storage used","",""],
            ["Payment failed","12 payments failed","",""],
            ["New fraud signals","16 accounts flagged","",""],
          ]}/>
        </div>

        <div className="guideTwoCol bottomRow">
          <GuideCard title="Top Performing Trainers" id="trainers">
            <div className="guideTable"><div><span>Trainer</span><span>Quality Score</span><span>Tasks Completed</span><span>Approval Rate</span></div>{[["Eleanor Pena","98.7%","1,432","99%"],["Devon Lane","97.8%","1,210","98%"],["Kathryn Murphy","97.2%","1,098","97%"],["Wade Warren","96.8%","1,023","97%"],["Esther Howard","96.5%","987","96%"]].map((r,i)=><div key={r[0]}><span><i>{["EP","DL","KM","WW","EH"][i]}</i>{r[0]}</span>{r.slice(1).map(x=><span key={x}>{x}</span>)}</div>)}</div><button className="guideTextButton">View leaderboard</button>
          </GuideCard>
          <GuideCard title="Quality Score Trend" id="quality" extra={<button>This Week⌄</button>}>
            <LineChart primary={[48,55,59,57,64,71,69,76,81,78,84,86]} labels={["May 12","May 13","May 14","May 15","May 16","May 17","May 18"]} compact/>
          </GuideCard>
        </div>
        <section className="adminJobs" id="job-admin">
          <header><div><small>TRAINER OPPORTUNITIES</small><h2>Jobs publishing</h2><p>Only approved trainers who meet the job’s verification and quality thresholds can apply.</p></div><strong>{jobs.filter(job=>job.status==="published").length} live jobs</strong></header>
          <div className="jobsAdminGrid">
            <form onSubmit={createJob}>
              <h3>Publish a job</h3>
              <label>Job title<input name="title" required placeholder="Medical QA Evaluation"/></label>
              <div><label>Client<input name="clientName" required placeholder="Client organization"/></label><label>Discipline<input name="discipline" required placeholder="Medicine"/></label></div>
              <label>Description<textarea name="description" required placeholder="Describe the work, outputs, and quality expectations."/></label>
              <label>Requirements, one per line<textarea name="requirements" required placeholder={"Verified professional credential\n90% quality score\nSafety assessment"}/></label>
              <div><label>Minimum rate<input name="rateMin" type="number" min="0" required/></label><label>Maximum rate<input name="rateMax" type="number" min="0" required/></label><label>Per<select name="rateUnit"><option value="task">Task</option><option value="hour">Hour</option></select></label></div>
              <div><label>Quality threshold<input name="requiredQualityScore" type="number" min="0" max="100" defaultValue="90"/></label><label>Openings<input name="openings" type="number" min="1" defaultValue="10"/></label><label>Weekly hours<input name="hoursPerWeek" placeholder="10–15 hours"/></label></div>
              <button>Publish to eligible trainers →</button>
            </form>
            <div className="publishedJobs"><h3>Published jobs</h3>{jobs.map(job=><article key={job.id}><i>◎</i><div><b>{job.title}</b><span>{job.clientName} · {job.discipline}</span><small>${job.rateMin}–${job.rateMax} per {job.rateUnit} · quality ≥ {job.requiredQualityScore}%</small></div><em>{job.openings} openings</em></article>)}</div>
          </div>
          <div className="jobApplicationQueue"><header><h3>Trainer applications</h3><span>{jobApplications.filter(item=>item.status==="submitted").length} awaiting review</span></header>{jobApplications.length?jobApplications.map(item=><article key={item.id}><div><b>{item.trainer_name}</b><span>{item.job_title} · {item.trainer_email}</span></div><p><b>{item.match_score}% match</b><small>{item.quality_score}% quality</small></p><em data-status={item.status}>{item.status}</em><div><button onClick={()=>applicantAction(`/api/admin/job-applications/${item.id}/decision`,{decision:"shortlisted"},"Trainer shortlisted for this job.")}>Shortlist</button><button onClick={()=>applicantAction(`/api/admin/job-applications/${item.id}/decision`,{decision:"assigned"},"Trainer assigned to this job.")}>Assign</button><button onClick={()=>applicantAction(`/api/admin/job-applications/${item.id}/decision`,{decision:"rejected"},"Job application declined.")}>Decline</button></div></article>):<div className="adminEmpty"><i>▦</i><b>No job applications yet</b><p>Eligible trainer applications will appear here.</p></div>}</div>
        </section>
        <section className="assessmentManager" id="assessment-admin"><div><small>ASSESSMENT GOVERNANCE</small><h2>Strict pre-screen controls</h2><p>The default test uses weighted questions, attempt limits, timed integrity signals, and an 80% pass threshold. Test passage never overrides identity, credentials, or human review.</p><div className="assessmentRules">{["Versioned question bank","Weighted safety questions","Maximum two attempts","Fast-completion risk flag","Manual score review","Complete audit history"].map(rule=><span key={rule}>✓ {rule}</span>)}</div></div><form onSubmit={createAssessment}><h3>Create an assessment version</h3><label>Title<input name="title" defaultValue="Trainora Core Quality & Integrity"/></label><div><label>Pass score<input name="passScore" type="number" min="1" max="100" defaultValue="80"/></label><label>Maximum attempts<input name="maxAttempts" type="number" min="1" max="5" defaultValue="2"/></label><label>Duration<input name="durationMinutes" type="number" min="5" defaultValue="25"/></label></div><button>Activate new version →</button></form></section>
        <section className="guideSpecStrip" id="platform"><div><h3>Technology Stack</h3><p><b>Frontend</b> Next.js 14 · React 18 · TypeScript · Tailwind · TanStack Query</p><p><b>Backend</b> Next.js API Routes · Node.js · PostgreSQL · Redis</p></div><div><h3>Chat Code Implementation Guide</h3><p>Use Inter throughout · glacier blue #3976c5 · 12px cards · responsive desktop-first layout.</p><button onClick={()=>setNotice("Implementation specification opened.")}>Open platform specification →</button></div></section>
      </div>
    </section>
  </main>
}

function GuideSidebar({nav,activeItem,onSelect}:{nav:[string,AdminNavItem[]][];activeItem:string;onSelect:(href:string,label:string)=>void}) {
  return <aside className="guideSide"><a className="guideLogo" href="/"><i>⬡</i><b>Trainora AI</b></a><nav>{nav.map(([group,items])=><section key={group}><small>{group}</small>{items.map(([label,icon,href])=><a className={activeItem===label?"active":""} href={href} key={label} onClick={()=>onSelect(href,label)}><i>{icon}</i>{label}</a>)}</section>)}</nav></aside>
}
function checkStatus(applicant:ApplicantSummary,...types:string[]){
  const relevant=applicant.checks.filter(check=>types.includes(check.type));
  if(relevant.some(check=>check.status==="failed"))return "failed";
  if(relevant.some(check=>["pending","in_progress","needs_review"].includes(check.status)))return "pending";
  if(relevant.some(check=>check.status==="passed"))return "passed";
  return "missing";
}
function QualityGate({label,status,detail}:{label:string;status:string;detail:string}){
  return <article data-status={status}><i>{status==="passed"?"✓":status==="failed"?"!":"○"}</i><p><b>{label}</b><span>{detail}</span></p><em>{status.replaceAll("_"," ")}</em></article>
}
function GuideTopbar({name,role}:{name:string;role:string}){return <header className="guideTop"><label>⌕ <input placeholder="Search anything…"/></label><div><button>♧</button><button>♢<i/></button><span>AM</span><p><b>{name}</b><small>{role}</small></p></div></header>}
function GuideKpi({label,value,note}:{label:string;value:string;note:string}){return <article><span>{label}</span><strong>{value}</strong><small>↗ {note}</small></article>}
function GuideCard({title,children,extra,id}:{title:string;children:React.ReactNode;extra?:React.ReactNode;id?:string}){return <section className="guideCard" id={id}><header><h3>{title}</h3>{extra}</header>{children}</section>}
function GuideListCard({title,rows,action,alert,id}:{title:string;rows:string[][];action:string;alert?:boolean;id?:string}){return <GuideCard title={title} id={id}><div className={`guideList ${alert?"alerts":""}`}>{rows.map((r,i)=><article key={r[0]}><i>{alert?"!":"⊙"}</i><p><b>{r[0]}</b><span>{r[1]}</span>{r[2]&&<small>{r[2]}</small>}</p>{r[3]&&<em>{r[3]}</em>}</article>)}</div><button className="guideTextButton">{action}</button></GuideCard>}
function LineChart({primary,secondary,labels,compact}:{primary:number[];secondary?:number[];labels:string[];compact?:boolean}){
  const polygon=`0% 100%, ${primary.map((v,i)=>`${i/(primary.length-1)*100}% ${100-v}%`).join(", ")}, 100% 100%`;
  const yLabels=compact?["100%","98%","96%","94%","92%"]:["40k","30k","20k","10k","0"];
  return <div className={`guideLineChart ${compact?"compact":""}`} role="img" aria-label={compact?"Quality score trend over seven days":"Completed and reviewed task trend over seven days"}>
    <div className="yAxis">{yLabels.map(label=><span key={label}>{label}</span>)}</div>
    <div className="lineGrid"/>
    <div className="plot">
      <i className="areaFill" style={{clipPath:`polygon(${polygon})`}}/>
      {primary.slice(0,-1).map((v,i)=><Segment key={`p${i}`} a={v} b={primary[i+1]} count={primary.length-1} index={i}/>)}
      {secondary&&secondary.slice(0,-1).map((v,i)=><Segment key={`s${i}`} a={v} b={secondary[i+1]} count={secondary.length-1} index={i} soft/>)}
      {primary.map((v,i)=><i className="point" data-value={compact?`${(92+v*.08).toFixed(1)}%`:`${Math.round(v*490).toLocaleString()} tasks`} key={i} style={{left:`${i/(primary.length-1)*100}%`,bottom:`${v}%`}}/>)}
    </div>
    <div className="axis">{labels.map(l=><span key={l}>{l}</span>)}</div>
  </div>
}
function Segment({a,b,count,index,soft}:{a:number;b:number;count:number;index:number;soft?:boolean}){const dx=100/count;const dy=b-a;const angle=Math.atan2(-dy,dx)*180/Math.PI;const length=Math.sqrt(dx*dx+dy*dy);return <i className={`segment ${soft?"soft":""}`} style={{left:`${index*dx}%`,bottom:`${a}%`,width:`${length}%`,transform:`rotate(${angle}deg)`}}/>}
