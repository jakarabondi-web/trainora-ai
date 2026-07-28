import { getCurrentUser } from "../../../../../../lib/server/current-user";
import { claimTask, trainerEligible } from "../../../../../../lib/server/tasks";
import { apiError, audit } from "../../../../../../lib/server/trainora-store";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    if (!(await trainerEligible(user.id))) {
      return Response.json({ error: "Approved trainer status is required to claim tasks." }, { status: 403 });
    }
    const { id: taskId } = await context.params;
    await claimTask(user.id, taskId);
    await audit(user.id, "task.claimed", "project_task", taskId, {});
    return Response.json({ status: "assigned" });
  } catch (error) {
    if (error instanceof Error && !error.message.includes("not connected")) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    return apiError(error);
  }
}
