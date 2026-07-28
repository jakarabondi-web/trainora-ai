import { getCurrentUser } from "../../../../lib/server/current-user";
import { organizationForUser } from "../../../../lib/server/client-portal";
import { apiError } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const organization = await organizationForUser(user.id);
    if (!organization) return Response.json({ error: "No client organization is linked to this account." }, { status: 404 });
    return Response.json({ organization }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
