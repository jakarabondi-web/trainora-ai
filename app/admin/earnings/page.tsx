import { DashboardIcon } from "../../components/DashboardIcon";
import { AdminSidebar } from "../AdminSidebar";
import { AdminEarningsManager } from "./AdminEarningsManager";

export const metadata = { title: "Earnings · Trainora AI" };

export default function AdminEarningsPage() {
  return <main className="guidePortal adminRoutePage">
    <AdminSidebar active="Earnings"/>
    <section className="guideMain">
      <header className="guideTop routeTopbar"><label><DashboardIcon name="search" size={18}/><input placeholder="Search payouts…"/></label><div><a href="/roles"><DashboardIcon name="roles" size={18}/> Roles</a><span>AM</span><p><b>Alex Morgan</b><small>Super Admin</small></p></div></header>
      <div className="guideCanvas">
        <header className="guidePageHead"><div><small>SUPER ADMIN / FINANCE</small><h1>Earnings</h1><p>Monitor trainer earnings and settle payout requests.</p></div></header>
        <AdminEarningsManager/>
      </div>
    </section>
  </main>;
}
