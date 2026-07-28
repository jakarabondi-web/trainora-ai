import { destroySession } from "../../../../lib/server/auth";
import { apiError } from "../../../../lib/server/trainora-store";

export async function POST() {
  try {
    await destroySession();
    return Response.json({ signedOut: true });
  } catch (error) {
    return apiError(error);
  }
}
