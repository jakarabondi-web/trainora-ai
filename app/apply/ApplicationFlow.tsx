"use client";
import { useState } from "react";

const questions = [
  {q:"A model makes a financial claim that is plausible but unsupported by the supplied source. What is the best rating?",options:["Accept—it is probably correct","Flag as unsupported and cite the missing evidence","Rewrite without recording an error","Skip the task"],answer:1},
  {q:"Two rubric criteria conflict. What should you do first?",options:["Choose the stricter criterion silently","Use personal judgment","Escalate with a specific citation to both criteria","Submit a neutral score"],answer:2},
  {q:"Which behavior most threatens evaluation integrity?",options:["Taking a scheduled break","Consulting allowed project references","Sharing task content in a public AI tool","Asking a reviewer for rubric clarification"],answer:2},
];

export function ApplicationFlow(){
  const [answers,setAnswers]=useState<number[]>([-1,-1,-1]);
  const [submitted,setSubmitted]=useState(false);
  const score=answers.reduce((n,a,i)=>n+(a===questions[i].answer?1:0),0);
  return <main className="applyPage">
    <header><a className="portalBrand darkLogo" href="/"><i>t</i><span>trainora<b>ai</b></span></a><div><span>Already have an account?</span><a href="/trainer">Sign in →</a></div></header>
    <section className="applyHero"><p>EXPERT APPLICATION</p><h1>Prove your expertise.<br/><em>Help build better AI.</em></h1><span>Quality comes first. Every expert completes the same transparent, evidence-based qualification process.</span></section>
    <div className="applicationLayout">
      <aside><p>YOUR APPLICATION</p>{[["01","Create account","Email, password, and consent"],["02","Verify identity","Government ID and liveness check"],["03","Validate expertise","Education, employment, and credentials"],["04","Pass pre-screening","Domain knowledge, judgment, and integrity"],["05","Complete calibration","Paid trial tasks against expert benchmarks"],["06","Human review","Final quality and risk decision"]].map(([n,t,d],i)=><div className={i===3?"current":i<3?"complete":""} key={n}><i>{i<3?"✓":n}</i><p><b>{t}</b><span>{d}</span></p></div>)}</aside>
      <section className="assessment">
        <div className="assessmentHead"><span>STEP 4 OF 6 · SAMPLE PRE-SCREEN</span><em>~4 minutes</em><h2>Quality judgment assessment</h2><p>This sample demonstrates how Trainora tests evidence use, rubric interpretation, and data security before applicants reach paid calibration.</p></div>
        {!submitted?<>
          {questions.map((q,qi)=><fieldset key={q.q}><legend><span>{qi+1}</span>{q.q}</legend>{q.options.map((o,oi)=><label className={answers[qi]===oi?"chosen":""} key={o}><input type="radio" name={`q${qi}`} checked={answers[qi]===oi} onChange={()=>setAnswers(a=>a.map((v,i)=>i===qi?oi:v))}/><i>{String.fromCharCode(65+oi)}</i>{o}</label>)}</fieldset>)}
          <div className="assessmentActions"><p>Answered {answers.filter(x=>x>=0).length} of {questions.length}</p><button disabled={answers.some(x=>x<0)} onClick={()=>setSubmitted(true)}>Submit sample assessment →</button></div>
        </>:<div className={`sampleResult ${score===3?"pass":"review"}`}><i>{score===3?"✓":"!"}</i><h2>{score===3?"Sample passed":"Additional review required"}</h2><strong>{score}/{questions.length}</strong><p>{score===3?"You demonstrated the required judgment and integrity signals. A real application would now unlock domain-specific testing.":"Your responses reveal one or more quality risks. A real applicant would receive targeted learning, one retake, or human review—not automatic project access."}</p><button onClick={()=>{setSubmitted(false);setAnswers([-1,-1,-1])}}>Retake sample</button><a href="/trainer">Preview trainer account →</a></div>}
      </section>
    </div>
    <section className="screeningSystem">
      <div><small>QUALITY GATE DESIGN</small><h2>How substandard work is prevented.</h2><p>No single test is treated as sufficient evidence. Access is earned and continuously revalidated.</p></div>
      <div className="gateGrid">{[
        ["Identity & fraud","Document authenticity, liveness, duplicate-account, sanctions, and device-risk checks."],
        ["Credential evidence","Institution and license validation, employment history, portfolio, and domain references."],
        ["Knowledge examination","Adaptive question bank with plagiarism detection, time analysis, and minimum domain thresholds."],
        ["Judgment assessment","Ambiguous cases testing evidence use, instruction following, escalation, and safety reasoning."],
        ["Paid calibration","Blind scoring against gold answers, reviewer agreement, error severity, and written rationale."],
        ["Probation period","Higher sampling during the first 50 tasks, restricted volumes, and daily anomaly monitoring."],
        ["Continuous monitoring","Hidden gold tasks, peer disagreement, speed anomalies, copied language, and quality decay alerts."],
        ["Fair intervention","Evidence packet, coaching, recalibration, appeal, suspension, and documented adjudication."],
      ].map(([t,d],i)=><article key={t}><i>{String(i+1).padStart(2,"0")}</i><h3>{t}</h3><p>{d}</p></article>)}</div>
    </section>
  </main>
}
