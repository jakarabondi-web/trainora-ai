import { capabilityGroups, getPlatformAnalytics } from "../../lib/platform-data";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = { title: "Super Admin · Trainora AI" };

export default function AdminPage() {
  const analytics = getPlatformAnalytics();
  return <AdminDashboard analytics={analytics} capabilityGroups={capabilityGroups} />;
}
