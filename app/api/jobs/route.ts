import { getCurrentUser } from "../../../lib/server/current-user";
import { apiError, ensureSeedJobs, getJobs } from "../../../lib/server/trainora-store";

export async function GET() {
  try {
    await ensureSeedJobs();
    const user = await getCurrentUser();
    const trainerId = user?.role === "trainer" ? user.id : undefined;
    return Response.json({ jobs: await getJobs(trainerId), authenticated: Boolean(user) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
