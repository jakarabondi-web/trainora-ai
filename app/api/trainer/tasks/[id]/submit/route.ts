import { getCurrentUser } from "../../../../../../lib/server/current-user";
import { submitTask } from "../../../../../../lib/server/tasks";
import { apiError, audit } from "../../../../../../lib/server/trainora-store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const { content } = await request.json() as { content?: string };
    if (!String(content ?? "").trim()) return Response.json({ error: "Submission content is required." }, { status: 400 });
    const { id: taskId } = await context.params;
    await submitTask(user.id, taskId, String(content));
    await audit(user.id, "task.submitted", "project_task", taskId, {});
    return Response.json({ status: "submitted" });
  } catch (error) {
    if (error instanceof Error && !error.message.includes("not connected")) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    return apiError(error);
  }
}
