export const metadata={title:"Trainer Dashboard · Trainora AI"};
import { DashboardIcon, type DashboardIconName } from "../components/DashboardIcon";
import { TrainerJobs } from "./TrainerJobs";
const trainerNav:[string,[string,DashboardIconName,string][]][]=[
  ["DASHBOARD",[["Dashboard","activity","#dashboard"]]],["PROJECTS",[["Jobs Marketplace","jobs","#jobs"],["My Projects","projects","#projects"],["Applications","files","#application-status"]]],
  ["TASKS",[["My Tasks","tasks","#tasks"],["Review Tasks","feedback","#feedback"],["Gold Tasks","target","#gold-tasks"]]],["ASSESSMENTS",[["My Assessments","assessment","/apply"],["Results","reports","#application-status"]]],
  ["EARNINGS",[["Overview","sales","#earnings"],["Payments","payments","#payments"],["Payout Methods","bank","#payout-methods"]]],["ACCOUNT",[["Profile","user","#profile"],["Settings","settings","#settings"],["Notifications","notifications","#notifications"],["Roles & access","roles","/roles"]]],["SUPPORT",[["Help Center","help","#support"],["Contact Support","support","mailto:support@trainora.ai"]]],
];
export default function TrainerPage(){return <main className="guidePortal trainerGuide"><aside className="guideSide dashboardDarkSide"><a className="guideLogo" href="/"><span className="logoMark"><DashboardIcon name="brain" size={22}/></span><b>Trainora AI</b></a><nav>{trainerNav.map(([g,items])=><section key={g}><small>{g}</small>{items.map(([l,icon,href],n)=><a className={g==="DASHBOARD"&&n===0?"active":""} href={href} key={l}><i><DashboardIcon name={icon} size={18}/></i>{l}</a>)}</section>)}</nav><a className="roleAccessLink" href="/roles"><DashboardIcon name="trainer" size={18}/><span><b>Trainer</b><small>Verified expert workspace</small></span></a></aside><section className="guideMain"><header className="guideTop routeTopbar"><label><DashboardIcon name="search" size={18}/><input placeholder="Search tasks, projects, or resources…"/></label><div><a href="/roles"><DashboardIcon name="roles" size={18}/> Roles</a><a href="#support" aria-label="Support"><DashboardIcon name="support" size={18}/></a><a href="#notifications" aria-label="Notifications"><DashboardIcon name="notifications" size={18}/></a><span>OB</span><p><b>Olivia Bennett</b><small>Expert Trainer</small></p></div></header><div className="guideCanvas" id="dashboard">
  <header className="guidePageHead"><div><h1>Welcome back, Olivia! 👋</h1><p>Here’s your work summary and next steps.</p></div></header>
  <div className="guideKpis five" id="earnings"><GuideKpiT label="Quality Score" value="96.8%" note="Excellent"/><GuideKpiT label="Tasks Completed" value="1,247" note="+56 this week"/><GuideKpiT label="Earnings This Week" value="$842.50" note="+12% this week"/><GuideKpiT label="Pending Payment" value="$1,256.00" note="Will be paid May 25"/><GuideKpiT label="Active Projects" value="3" note="View projects"/></div>
  <div className="guideTwoCol trainerTop">
    <section className="guideCard" id="tasks"><header><h3>Your Active Tasks</h3></header><div className="activeTaskList">{[["Math Reasoning Evaluation","TASK #C0921","Due in 2h 15m","$4.50"],["Code Generation Review","TASK #C0832","Due in 8h 45m","$6.00"],["Safety Classification","TASK #C0103","Due in 9h 10m","$3.25"]].map(([t,id,due,rate])=><article key={id}><p><b>{t}</b><span>{id}</span><small>{due}</small></p><p><b>{rate}</b><a href="#tasks">Continue</a></p></article>)}</div><a className="guideTextButton" href="#tasks">View all tasks</a></section>
    <section className="guideCard" id="progress"><header><h3>Weekly Task Progress</h3><strong className="chartTotal">1,247 <small>tasks</small></strong></header><WeeklyProgressChart/></section>
  </div>
  <div className="guideTwoCol trainerMid">
    <section className="guideCard" id="projects"><header><h3>Recommended Projects</h3></header><div className="recommendList">{[["Medical QA Evaluation","Cinder Research","95% match"],["Legal Reasoning Dataset","Nexora","90% match"],["Multilingual SFT Project","Vector Labs","90% match"]].map(([t,c,m])=><article key={t}><i><DashboardIcon name="projects" size={17}/></i><p><b>{t}</b><span>{c}</span><small>$5.00 – $8.00 per task · 10–15h/week</small></p><em>{m}</em><a href="/apply">Apply</a></article>)}</div></section>
    <section className="guideCard" id="feedback"><header><h3>Recent Feedback</h3></header><div className="feedbackList">{[["Great attention to detail and accurate scoring.","Math Reasoning Eval · 3h ago","good"],["Your justifications are very helpful.","Code Generation Review · 1d ago","good"],["Try to provide more examples in your reasoning.","Safety Classification · 2d ago","warn"]].map(([t,d,c])=><article key={t}><i className={c}><DashboardIcon name={c==="warn"?"fraud":"feedback"} size={16}/></i><p><b>{t}</b><span>{d}</span></p></article>)}</div><a className="guideTextButton" href="#feedback">View all feedback</a></section>
  </div>
  <TrainerJobs/>
  <section className="trainerApprovalStatus" id="application-status">
    <header><div><small>ACCOUNT ELIGIBILITY</small><h2>Your approval and verification status</h2><p>Project access is controlled by these quality gates and continuously rechecked.</p></div><strong>Approved trainer</strong></header>
    <div>{[["Email verified","Your account email has been confirmed.","passed"],["Identity verified","Government ID, selfie match, and liveness passed.","passed"],["Credentials validated","Professional evidence reviewed by Trainora.","passed"],["Core assessment","Quality and integrity assessment passed.","passed"],["Quality probation","First 50 tasks receive enhanced review sampling.","active"]].map(([title,description,status])=><article data-status={status} key={title}><i>{status==="passed"?"✓":"●"}</i><p><b>{title}</b><span>{description}</span></p><em>{status}</em></article>)}</div>
    <p className="trainerApprovalNote">Trainora may request renewed identity or credential checks when documents expire, account risk changes, or a project requires a higher verification level.</p>
  </section>
  <section className="trainerOperations">
    <article className="guideCard" id="gold-tasks"><header><h3>Gold Task Qualification</h3><a href="/apply">Open assessments →</a></header><div className="trainerOpsBody"><strong>18 / 20 passed</strong><p>Hidden quality tasks continuously confirm rubric accuracy and unlock advanced projects.</p><span>Next calibration due in 12 days</span></div></article>
    <article className="guideCard" id="payments"><header><h3>Payment History</h3><a href="#payout-methods">Manage payout →</a></header><div className="trainerOpsList">{[["May 18, 2025","Weekly task earnings","$842.50","Paid"],["May 11, 2025","Weekly task earnings","$775.25","Paid"],["May 4, 2025","Weekly task earnings","$690.00","Paid"]].map(row=><p key={row[0]}><span><b>{row[1]}</b><small>{row[0]}</small></span><strong>{row[2]}</strong><em>{row[3]}</em></p>)}</div></article>
    <article className="guideCard" id="payout-methods"><header><h3>Payout Method</h3><a href="#settings">Account settings →</a></header><div className="trainerOpsBody"><strong>Bank account •••• 4921</strong><p>Primary payout method · USD · Weekly schedule</p><span>Identity name match verified</span></div></article>
    <article className="guideCard" id="profile"><header><h3>Expert Profile</h3><a href="/apply">Update credentials →</a></header><div className="trainerOpsBody"><strong>Olivia Bennett</strong><p>Medical evaluation · English · United States</p><span>Profile completeness 94%</span></div></article>
    <article className="guideCard" id="settings"><header><h3>Account Settings</h3><a href="#notifications">Notification preferences →</a></header><div className="trainerOpsList"><p><span><b>Two-factor authentication</b><small>Required for restricted projects</small></span><em>Enabled</em></p><p><span><b>Data access alerts</b><small>Email and in-app notification</small></span><em>Enabled</em></p></div></article>
  </section>
  <div className="guideTwoCol trainerBottom">
    <section className="guideCard" id="notifications"><header><h3>Notifications</h3></header><div className="notificationList">{[["New task available","Math Reasoning Evaluation","2m ago"],["Your task was approved","Code Generation Review","1h ago"],["Payment scheduled","$1,156.00","3h ago"],["New project match","Medical QA Evaluation","1d ago"],["Assessment assigned","Safety & Policy Evaluation","2d ago"]].map(([t,d,time])=><article key={t}><i><DashboardIcon name="notifications" size={16}/></i><p><b>{t}</b><span>{d}</span></p><em>{time}</em></article>)}</div><a className="guideTextButton" href="#notifications">View all notifications</a></section>
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
