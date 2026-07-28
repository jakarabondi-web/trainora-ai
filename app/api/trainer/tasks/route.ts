import { getCurrentUser } from "../../../../lib/server/current-user";
import { myTasks, openTasks, trainerEligible } from "../../../../lib/server/tasks";
import { apiError } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const eligible = await trainerEligible(user.id);
    const [open, mine] = await Promise.all([openTasks(), myTasks(user.id)]);
    return Response.json({ eligible, openTasks: open, myTasks: mine }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
