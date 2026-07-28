export const metadata = { title: "Reviewer Workspace · Trainora AI" };
import { DashboardIcon } from "../components/DashboardIcon";
import { ReviewerWorkspace } from "./ReviewerWorkspace";

export default function ReviewerPage(){
  return <main className="portal reviewerPortal">
    <aside className="portalSide dashboardDarkSide"><a className="portalBrand" href="/"><i><DashboardIcon name="brain" size={20}/></i><span>trainora<b>ai</b></span><em>REVIEWER</em></a><nav><a className="selected" href="#review-queue"><i><DashboardIcon name="tasks" size={18}/></i>Review queue</a><a href="/roles"><i><DashboardIcon name="roles" size={18}/></i>Roles & access</a></nav></aside>
    <section className="portalMain"><header className="portalTop"><div><small>REVIEWER WORKSPACE</small><h1>Review queue</h1></div></header>
      <div className="roleContent">
        <ReviewerWorkspace/>
      </div>
    </section>
  </main>
}
