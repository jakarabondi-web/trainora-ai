import { adminOnly } from "../../../../../lib/server/access";
import { setUserRole, setUserStatus } from "../../../../../lib/server/admin-users";
import { apiError, audit, database } from "../../../../../lib/server/trainora-store";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const { id: userId } = await context.params;
    const body = await request.json() as { role?: string; status?: "active" | "suspended" };
    const actor = await database().prepare("SELECT id FROM users WHERE email = ?").bind(access.user!.email.toLowerCase()).first() as { id: string } | null;
    if (body.status === "suspended" && actor?.id === userId) {
      return Response.json({ error: "You cannot suspend your own account." }, { status: 400 });
    }
    if (body.role) {
      await setUserRole(userId, body.role);
      await audit(access.user!.email, "user.role_changed", "user", userId, { role: body.role });
    }
    if (body.status) {
      await setUserStatus(userId, body.status);
      await audit(access.user!.email, "user.status_changed", "user", userId, { status: body.status });
    }
    return Response.json({ updated: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unsupported role.") {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return apiError(error);
  }
}
