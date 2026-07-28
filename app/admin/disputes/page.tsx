import { DashboardIcon } from "../../components/DashboardIcon";
import { AdminSidebar } from "../AdminSidebar";
import { AdminDisputesManager } from "./AdminDisputesManager";

export const metadata = { title: "Disputes · Trainora AI" };

export default function AdminDisputesPage() {
  return <main className="guidePortal adminRoutePage">
    <AdminSidebar active="Disputes"/>
    <section className="guideMain">
      <header className="guideTop routeTopbar"><label><DashboardIcon name="search" size={18}/><input placeholder="Search disputes…"/></label><div><a href="/roles"><DashboardIcon name="roles" size={18}/> Roles</a><span>AM</span><p><b>Alex Morgan</b><small>Super Admin</small></p></div></header>
      <div className="guideCanvas">
        <header className="guidePageHead"><div><small>SUPER ADMIN / FINANCE</small><h1>Disputes</h1><p>Resolve trainer, client, and payment disputes.</p></div></header>
        <AdminDisputesManager/>
      </div>
    </section>
  </main>;
}
