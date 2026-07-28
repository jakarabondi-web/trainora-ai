import { DashboardIcon } from "../../components/DashboardIcon";
import { AdminSidebar } from "../AdminSidebar";
import { AdminJobsManager } from "./AdminJobsManager";

export const metadata = { title: "Jobs Operations · Trainora AI" };

export default function AdminJobsPage() {
  return <main className="guidePortal adminRoutePage">
    <AdminSidebar active="Jobs"/>
    <section className="guideMain">
      <header className="guideTop routeTopbar"><label><DashboardIcon name="search" size={18}/><input placeholder="Search jobs, sources, or clients…"/></label><div><a href="/roles"><DashboardIcon name="roles" size={18}/> Roles</a><a href="/admin/alerts"><DashboardIcon name="notifications" size={18}/></a><span>AM</span><p><b>Alex Morgan</b><small>Super Admin</small></p></div></header>
      <div className="guideCanvas">
        <header className="guidePageHead"><div><small>SUPER ADMIN / DELIVERY</small><h1>Jobs operations</h1><p>Publish, bulk import, synchronize, and audit every trainer opportunity.</p></div><a className="pageAction" href="/trainer#jobs"><DashboardIcon name="trainer" size={17}/> View trainer marketplace</a></header>
        <AdminJobsManager/>
      </div>
    </section>
  </main>;
}
