import { DashboardIcon } from "../../components/DashboardIcon";
import { AdminSidebar } from "../AdminSidebar";
import { AdminTicketsManager } from "./AdminTicketsManager";

export const metadata = { title: "Support tickets · Trainora AI" };

export default function AdminTicketsPage() {
  return <main className="guidePortal adminRoutePage">
    <AdminSidebar active="Support tickets"/>
    <section className="guideMain">
      <header className="guideTop routeTopbar"><label><DashboardIcon name="search" size={18}/><input placeholder="Search tickets…"/></label><div><a href="/roles"><DashboardIcon name="roles" size={18}/> Roles</a><span>AM</span><p><b>Alex Morgan</b><small>Super Admin</small></p></div></header>
      <div className="guideCanvas">
        <header className="guidePageHead"><div><small>SUPER ADMIN / OPERATIONS</small><h1>Support tickets</h1><p>Reply to and resolve trainer and client support tickets.</p></div></header>
        <AdminTicketsManager/>
      </div>
    </section>
  </main>;
}
