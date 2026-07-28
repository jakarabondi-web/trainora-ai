import { DashboardIcon } from "../../components/DashboardIcon";
import { AdminSidebar } from "../AdminSidebar";
import { AdminInvoicesManager } from "./AdminInvoicesManager";

export const metadata = { title: "Invoices · Trainora AI" };

export default function AdminInvoicesPage() {
  return <main className="guidePortal adminRoutePage">
    <AdminSidebar active="Invoices"/>
    <section className="guideMain">
      <header className="guideTop routeTopbar"><label><DashboardIcon name="search" size={18}/><input placeholder="Search invoices…"/></label><div><a href="/roles"><DashboardIcon name="roles" size={18}/> Roles</a><span>AM</span><p><b>Alex Morgan</b><small>Super Admin</small></p></div></header>
      <div className="guideCanvas">
        <header className="guidePageHead"><div><small>SUPER ADMIN / FINANCE</small><h1>Invoices</h1><p>Issue client invoices and track payment status.</p></div></header>
        <AdminInvoicesManager/>
      </div>
    </section>
  </main>;
}
