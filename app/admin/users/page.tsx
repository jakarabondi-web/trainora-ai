import { DashboardIcon } from "../../components/DashboardIcon";
import { AdminSidebar } from "../AdminSidebar";
import { AdminUsersManager } from "./AdminUsersManager";

export const metadata = { title: "Users & roles · Trainora AI" };

export default function AdminUsersPage() {
  return <main className="guidePortal adminRoutePage">
    <AdminSidebar active="Users & roles"/>
    <section className="guideMain">
      <header className="guideTop routeTopbar"><label><DashboardIcon name="search" size={18}/><input placeholder="Search users…"/></label><div><a href="/roles"><DashboardIcon name="roles" size={18}/> Roles</a><span>AM</span><p><b>Alex Morgan</b><small>Super Admin</small></p></div></header>
      <div className="guideCanvas">
        <header className="guidePageHead"><div><small>SUPER ADMIN / PEOPLE</small><h1>Users and roles</h1><p>Grant or revoke roles, and suspend accounts, across every user on the platform.</p></div></header>
        <AdminUsersManager/>
      </div>
    </section>
  </main>;
}
