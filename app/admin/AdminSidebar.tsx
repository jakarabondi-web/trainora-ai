import { DashboardIcon, type DashboardIconName } from "../components/DashboardIcon";

export const adminNavigation: Array<[string, Array<[string, DashboardIconName, string]>]> = [
  ["OVERVIEW", [["Overview", "activity", "/admin"]]],
  ["PEOPLE", [
    ["Applicants", "user", "/admin/applicants"], ["Trainers", "trainer", "/admin/trainers"],
    ["Clients", "client", "/admin/clients"], ["Reviewers", "reviewer", "/admin/reviewers"],
  ]],
  ["DELIVERY", [
    ["Jobs", "jobs", "/admin/jobs"], ["Projects", "projects", "/admin/projects"],
    ["Tasks", "tasks", "/admin/tasks"], ["Reviews", "feedback", "/admin/reviews"],
  ]],
  ["QUALITY", [
    ["Quality", "quality", "/admin/quality"], ["Assessments", "assessment", "/admin/assessments"],
    ["Gold tasks", "target", "/admin/gold-tasks"], ["Calibration", "reports", "/admin/calibration"],
  ]],
  ["FINANCE", [
    ["Earnings", "sales", "/admin/earnings"], ["Invoices", "invoices", "/admin/invoices"],
    ["Disputes", "disputes", "/admin/disputes"],
  ]],
  ["OPERATIONS", [
    ["Support tickets", "support", "/admin/tickets"], ["Alerts", "notifications", "/admin/alerts"],
    ["Audit logs", "audit", "/admin/audit-logs"], ["Fraud detection", "fraud", "/admin/fraud"],
    ["Settings", "settings", "/admin/settings"], ["Roles & access", "roles", "/roles"],
  ]],
];

export function AdminSidebar({ active = "Overview" }: { active?: string }) {
  return <aside className="guideSide dashboardDarkSide">
    <a className="guideLogo" href="/"><span className="logoMark"><DashboardIcon name="brain" size={22}/></span><b>Trainora AI</b></a>
    <nav>{adminNavigation.map(([group, items]) => <section key={group}>
      <small>{group}</small>
      {items.map(([label, icon, href]) => <a className={active === label ? "active" : ""} href={href} key={label}>
        <i><DashboardIcon name={icon} size={18}/></i>{label}
      </a>)}
    </section>)}</nav>
    <a className="roleAccessLink" href="/roles"><DashboardIcon name="roles" size={18}/><span><b>Super Admin</b><small>Full platform control</small></span></a>
  </aside>;
}
