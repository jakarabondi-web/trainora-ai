import { DashboardIcon } from "../components/DashboardIcon";

export const metadata = { title: "Roles & Permissions · Trainora AI" };

const roles = [
  {name:"Super Admin",icon:"security" as const,href:"/admin",summary:"Controls the full platform, including people, jobs, projects, quality, finance, risk, integrations, and audit history.",abilities:["Approve or reject trainers","Review identity and credentials","Publish, import, and sync jobs","Manage assessments and quality","Control clients, reviewers, payments, and risk"]},
  {name:"Client",icon:"client" as const,href:"/client",summary:"Creates and monitors AI data projects without access to restricted trainer identity evidence or platform-wide controls.",abilities:["Create project briefs","Monitor workforce and tasks","Review quality and delivery","Export approved datasets","Manage budgets and integrations"]},
  {name:"Trainer",icon:"trainer" as const,href:"/trainer",summary:"Completes verified AI work after passing identity, credential, assessment, and continuous quality checks.",abilities:["Browse eligible jobs","Complete assigned tasks","View feedback and quality","Manage assessments and credentials","Track earnings and payments"]},
  {name:"Reviewer",icon:"reviewer" as const,href:"/reviewer",summary:"Performs peer review, gold-task review, calibration, and adjudication within approved domains.",abilities:["Review submitted work","Apply project rubrics","Resolve disagreements","Complete calibration","Send structured feedback"]},
];

const permissions = [
  ["Approve trainer accounts","✓","—","—","—"],["View protected identity evidence","✓","—","Own only","Assigned only"],
  ["Publish and import jobs","✓","Project request","—","—"],["Apply for jobs","—","—","✓","—"],
  ["Create client projects","✓","✓","—","—"],["Complete production tasks","—","—","✓","Review only"],
  ["Review and adjudicate","Manage","View","Limited","✓"],["Manage payments and disputes","✓","Own billing","Own earnings","—"],
  ["View platform audit logs","✓","Workspace only","Own activity","Assigned activity"],
];

export default function RolesPage() {
  return <main className="rolesPage">
    <nav className="rolesTop"><a href="/"><span><DashboardIcon name="brain" size={21}/></span><b>Trainora AI</b></a><div><a href="/admin">Super Admin</a><a href="/client">Client</a><a href="/trainer">Trainer</a><a href="/reviewer">Reviewer</a></div></nav>
    <header className="rolesHero"><small>IDENTITY, ACCESS & RESPONSIBILITY</small><h1>Clear roles. Strict boundaries.<br/>Accountable AI operations.</h1><p>Every Trainora role sees only the tools and information required for its work. Sensitive evidence and privileged actions remain restricted to authorized administrators.</p></header>
    <section className="roleDefinitionGrid">{roles.map(role=><article key={role.name}><span><DashboardIcon name={role.icon} size={24}/></span><h2>{role.name}</h2><p>{role.summary}</p><ul>{role.abilities.map(ability=><li key={ability}><DashboardIcon name="quality" size={15}/>{ability}</li>)}</ul><a href={role.href}>Open {role.name} workspace <DashboardIcon name="arrow" size={17}/></a></article>)}</section>
    <section className="permissionSection"><header><small>PERMISSIONS MATRIX</small><h2>Who can do what</h2><p>“Own” and “assigned” access is scoped to the signed-in account and audited.</p></header><div className="permissionTable"><div><b>Capability</b><b>Super Admin</b><b>Client</b><b>Trainer</b><b>Reviewer</b></div>{permissions.map(row=><div key={row[0]}>{row.map((cell,index)=><span key={`${index}-${cell}`} className={index===0?"permissionName":cell==="—"?"permissionNone":""}>{cell}</span>)}</div>)}</div></section>
    <section className="roleSecurityCallout"><DashboardIcon name="security" size={30}/><div><h2>Authorization is enforced on the server</h2><p>Hidden menu items are not the security boundary. Protected API actions independently verify the signed-in user and administrator allowlist, and every privileged change is written to the audit history.</p></div><a href="/admin/settings">Review access settings</a></section>
  </main>;
}
