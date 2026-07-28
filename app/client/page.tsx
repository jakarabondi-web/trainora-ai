export const metadata = { title: "Client Workspace · Trainora AI" };
import { DashboardIcon, type DashboardIconName } from "../components/DashboardIcon";
import { ClientWorkspace } from "./ClientWorkspace";

export default function ClientPage(){
  const clientNav:[string,DashboardIconName,string][]=[["Overview","activity","#overview"],["Projects","projects","#projects"],["Billing","billing","#billing"],["Roles & access","roles","/roles"]];
  return <main className="portal clientPortal">
    <aside className="portalSide dashboardDarkSide"><a className="portalBrand" href="/"><i><DashboardIcon name="brain" size={20}/></i><span>trainora<b>ai</b></span><em>CLIENT</em></a><nav>{clientNav.map(([l,icon,href],n)=><a className={n===0?"selected":""} href={href} key={l}><i><DashboardIcon name={icon} size={18}/></i>{l}</a>)}</nav><a className="profileMini" href="/roles"><i>CL</i><span><b>Client workspace</b><small>AI company</small></span><em><DashboardIcon name="roles" size={16}/></em></a></aside>
    <section className="portalMain"><header className="portalTop"><div><small>CLIENT WORKSPACE</small><h1>Portfolio overview</h1></div></header>
      <div className="roleContent" id="overview">
        <ClientWorkspace/>
      </div>
    </section>
  </main>
}
