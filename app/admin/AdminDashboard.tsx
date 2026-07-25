"use client";

import { useState } from "react";
import type { PlatformAnalytics } from "../../lib/platform-data";

type CapabilityGroup = {group:string;tools:string[]};
type AdminNavItem = [string, string, string];

const adminNav: [string, AdminNavItem[]][] = [
  ["OVERVIEW",[["Overview","▣","#overview"]]],
  ["USERS",[["Trainers","♙","#trainers"],["Clients","♧","#projects"],["Reviewers","◎","#status"],["Leads","◉","#pending"]]],
  ["PROJECTS",[["All Projects","▦","#projects"],["Tasks","▤","#trend"],["Reviews","◫","#status"]]],
  ["QUALITY",[["Quality Dashboard","◇","#quality"],["Assessments","◌","#quality"],["Gold Tasks","◆","#quality"],["Calibration","◉","#quality"]]],
  ["PAYMENTS",[["Earnings","$","#overview"],["Invoices","▤","#overview"],["Disputes","◎","#pending"]]],
  ["SUPPORT",[["Tickets","◇","#pending"],["Alerts","△","#alerts"]]],
  ["SYSTEM",[["Audit Logs","▥","#alerts"],["Fraud Detection","◇","#alerts"],["Settings","⚙","#platform"]]],
];

export function AdminDashboard({analytics}:{analytics:PlatformAnalytics;capabilityGroups:CapabilityGroup[]}) {
  const [notice,setNotice]=useState("");
  const [activeItem,setActiveItem]=useState("Overview");
  const m=analytics.metrics;
  return <main className="guidePortal">
    <GuideSidebar nav={adminNav} activeItem={activeItem} onSelect={(href,label)=>{setActiveItem(label);setNotice(`${label} section opened.`)}}/>
    <section className="guideMain">
      <GuideTopbar name="Alex Morgan" role="Super Admin"/>
      <div className="guideCanvas">
        <header className="guidePageHead"><div><h1>Admin Overview</h1><p>Welcome back, Alex. Here’s what’s happening on Trainora AI today.</p></div><button>May 12 – May 18, 2025⌄</button></header>
        {notice&&<div className="guideNotice">✓ {notice}<button onClick={()=>setNotice("")}>×</button></div>}
        <div className="guideKpis five" id="overview">
          <GuideKpi label="Active Trainers" value="12,847" note="+12.4% from last week"/>
          <GuideKpi label="Active Projects" value="128" note="+8.2% from last week"/>
          <GuideKpi label="Tasks Completed" value="32,841" note="+17.1% from last week"/>
          <GuideKpi label="Quality Score" value={`${m.reviewAgreement}%`} note="+2.1% from last week"/>
          <GuideKpi label="Total Payouts" value="$284,915" note="+8.6% from last week"/>
        </div>

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
        <section className="guideSpecStrip" id="platform"><div><h3>Technology Stack</h3><p><b>Frontend</b> Next.js 14 · React 18 · TypeScript · Tailwind · TanStack Query</p><p><b>Backend</b> Next.js API Routes · Node.js · PostgreSQL · Redis</p></div><div><h3>Chat Code Implementation Guide</h3><p>Use Inter throughout · glacier blue #3976c5 · 12px cards · responsive desktop-first layout.</p><button onClick={()=>setNotice("Implementation specification opened.")}>Open platform specification →</button></div></section>
      </div>
    </section>
  </main>
}

function GuideSidebar({nav,activeItem,onSelect}:{nav:[string,AdminNavItem[]][];activeItem:string;onSelect:(href:string,label:string)=>void}) {
  return <aside className="guideSide"><a className="guideLogo" href="/"><i>⬡</i><b>Trainora AI</b></a><nav>{nav.map(([group,items])=><section key={group}><small>{group}</small>{items.map(([label,icon,href])=><a className={activeItem===label?"active":""} href={href} key={label} onClick={()=>onSelect(href,label)}><i>{icon}</i>{label}</a>)}</section>)}</nav></aside>
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
