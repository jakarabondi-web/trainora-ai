import { getChatGPTUser } from "../../chatgpt-auth";
import { apiError, database, ensureSeedJobs, getJobs } from "../../../lib/server/trainora-store";

export async function GET() {
  try {
    await ensureSeedJobs();
    const user = await getChatGPTUser();
    let trainerId: string | undefined;
    if (user) {
      const record = await database().prepare("SELECT id FROM users WHERE email = ? AND role = 'trainer'")
        .bind(user.email.toLowerCase()).first() as { id: string } | null;
      trainerId = record?.id;
    }
    return Response.json({ jobs: await getJobs(trainerId), authenticated: Boolean(user) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

