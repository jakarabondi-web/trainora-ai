import { adminOnly } from "../../../../lib/server/access";
import { apiError, getApplicants } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    return Response.json({ applicants: await getApplicants() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

