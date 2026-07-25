export const metadata={title:"Trainer Dashboard · Trainora AI"};
const trainerNav:[string,[string,string,string][]][]=[
  ["DASHBOARD",[["Dashboard","▣","#dashboard"]]],["PROJECTS",[["My Projects","▦","#projects"],["Available Projects","◎","#projects"],["Applications","♧","/apply"]]],
  ["TASKS",[["My Tasks","▤","#tasks"],["Review Tasks","◫","#feedback"],["Gold Tasks","◆","#progress"]]],["ASSESSMENTS",[["My Assessments","◇","/apply"],["Results","◎","#progress"]]],
  ["EARNINGS",[["Overview","$","#earnings"],["Payments","▥","#earnings"],["Payout Methods","◎","#earnings"]]],["ACCOUNT",[["Profile","♙","#dashboard"],["Settings","⚙","#notifications"],["Notifications","♢","#notifications"]]],["SUPPORT",[["Help Center","?","#support"],["Contact Support","♧","#support"]]],
];
export default function TrainerPage(){return <main className="guidePortal trainerGuide"><aside className="guideSide"><a className="guideLogo" href="/"><i>⬡</i><b>Trainora AI</b></a><nav>{trainerNav.map(([g,items])=><section key={g}><small>{g}</small>{items.map(([l,i,href],n)=><a className={g==="DASHBOARD"&&n===0?"active":""} href={href} key={l}><i>{i}</i>{l}</a>)}</section>)}</nav></aside><section className="guideMain"><header className="guideTop"><label>⌕ <input placeholder="Search tasks, projects, or resources…"/></label><div><button>♧</button><button>♢<i/></button><span>OB</span><p><b>Olivia Bennett</b><small>Expert Trainer</small></p></div></header><div className="guideCanvas" id="dashboard">
  <header className="guidePageHead"><div><h1>Welcome back, Olivia! 👋</h1><p>Here’s your work summary and next steps.</p></div></header>
  <div className="guideKpis five" id="earnings"><GuideKpiT label="Quality Score" value="96.8%" note="Excellent"/><GuideKpiT label="Tasks Completed" value="1,247" note="+56 this week"/><GuideKpiT label="Earnings This Week" value="$842.50" note="+12% this week"/><GuideKpiT label="Pending Payment" value="$1,256.00" note="Will be paid May 25"/><GuideKpiT label="Active Projects" value="3" note="View projects"/></div>
  <div className="guideTwoCol trainerTop">
    <section className="guideCard" id="tasks"><header><h3>Your Active Tasks</h3></header><div className="activeTaskList">{[["Math Reasoning Evaluation","TASK #C0921","Due in 2h 15m","$4.50"],["Code Generation Review","TASK #C0832","Due in 8h 45m","$6.00"],["Safety Classification","TASK #C0103","Due in 9h 10m","$3.25"]].map(([t,id,due,rate])=><article key={id}><p><b>{t}</b><span>{id}</span><small>{due}</small></p><p><b>{rate}</b><a href="#tasks">Continue</a></p></article>)}</div><a className="guideTextButton" href="#tasks">View all tasks</a></section>
    <section className="guideCard" id="progress"><header><h3>Weekly Task Progress</h3><strong className="chartTotal">1,247 <small>tasks</small></strong></header><WeeklyProgressChart/></section>
  </div>
  <div className="guideTwoCol trainerMid">
    <section className="guideCard" id="projects"><header><h3>Recommended Projects</h3></header><div className="recommendList">{[["Medical QA Evaluation","Cinder Research","95% match"],["Legal Reasoning Dataset","Nexora","90% match"],["Multilingual SFT Project","Vector Labs","90% match"]].map(([t,c,m])=><article key={t}><i>◎</i><p><b>{t}</b><span>{c}</span><small>$5.00 – $8.00 per task · 10–15h/week</small></p><em>{m}</em><a href="/apply">Apply</a></article>)}</div></section>
    <section className="guideCard" id="feedback"><header><h3>Recent Feedback</h3></header><div className="feedbackList">{[["Great attention to detail and accurate scoring.","Math Reasoning Eval · 3h ago","good"],["Your justifications are very helpful.","Code Generation Review · 1d ago","good"],["Try to provide more examples in your reasoning.","Safety Classification · 2d ago","warn"]].map(([t,d,c])=><article key={t}><i className={c}>⊙</i><p><b>{t}</b><span>{d}</span></p></article>)}</div><a className="guideTextButton" href="#feedback">View all feedback</a></section>
  </div>
  <div className="guideTwoCol trainerBottom">
    <section className="guideCard" id="notifications"><header><h3>Notifications</h3></header><div className="notificationList">{[["New task available","Math Reasoning Evaluation","2m ago"],["Your task was approved","Code Generation Review","1h ago"],["Payment scheduled","$1,156.00","3h ago"],["New project match","Medical QA Evaluation","1d ago"],["Assessment assigned","Safety & Policy Evaluation","2d ago"]].map(([t,d,time])=><article key={t}><i>⊙</i><p><b>{t}</b><span>{d}</span></p><em>{time}</em></article>)}</div><a className="guideTextButton" href="#notifications">View all notifications</a></section>
    <section className="growthCard" id="support"><div><h2>Grow your expertise<br/>and unlock more<br/>opportunities.</h2>{["Complete assessments","Maintain high quality","Get advanced projects","Earn quality bonuses"].map(x=><p key={x}>✓ {x}</p>)}<a href="/apply">View my progress →</a></div><div className="awardSeal">✓</div></section>
  </div>
 </div></section></main>}
function GuideKpiT({label,value,note}:{label:string;value:string;note:string}){return <article><span>{label}</span><strong>{value}</strong><small>{note}</small></article>}
function WeeklyProgressChart(){
  const days=[
    {day:"Mon",completed:108,reviewed:82},{day:"Tue",completed:146,reviewed:118},
    {day:"Wed",completed:121,reviewed:94},{day:"Thu",completed:178,reviewed:151},
    {day:"Fri",completed:139,reviewed:112},{day:"Sat",completed:156,reviewed:127},
    {day:"Sun",completed:84,reviewed:62},
  ];
  return <div className="weeklyChart" role="img" aria-label="Completed and reviewed tasks by weekday">
    <div className="miniLegend"><span><i/>Completed</span><span><i/>Reviewed</span></div>
    <div className="weeklyPlot">
      <div className="barYAxis">{["200","150","100","50","0"].map(v=><span key={v}>{v}</span>)}</div>
      <div className="barGrid"/>
      <div className="barGroups">{days.map(d=><div className="barGroup" key={d.day}>
        <div className="barPair"><i data-value={`${d.completed} completed`} style={{height:`${d.completed/2}%`}}/><em data-value={`${d.reviewed} reviewed`} style={{height:`${d.reviewed/2}%`}}/></div>
        <span>{d.day}</span>
      </div>)}</div>
    </div>
  </div>
}
