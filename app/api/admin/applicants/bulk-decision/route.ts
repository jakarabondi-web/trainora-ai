import { adminOnly } from "../../../../../lib/server/access";
import { recordApplicantDecision } from "../../../../../lib/server/applicant-review";
import { apiError } from "../../../../../lib/server/trainora-store";

export async function POST(request: Request) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const body = await request.json() as { applicantIds?: string[]; decision?: string; notes?: string };
    if (body.decision !== "approved" || !Array.isArray(body.applicantIds) || !body.applicantIds.length) {
      return Response.json({ error: "Select one or more applicants for bulk approval." }, { status: 400 });
    }
    if (body.applicantIds.length > 100) {
      return Response.json({ error: "Bulk approval is limited to 100 applicants per audited action." }, { status: 400 });
    }
    const results = [];
    for (const applicantId of [...new Set(body.applicantIds)]) {
      const result = await recordApplicantDecision(
        applicantId,
        "approved",
        body.notes ?? "Bulk approved after all mandatory automated and human-reviewed gates passed.",
        access.user!.email,
      );
      results.push({ applicantId, ...result });
    }
    return Response.json({
      approved: results.filter((result) => result.ok).length,
      blocked: results.filter((result) => !result.ok).length,
      results,
    });
  } catch (error) {
    return apiError(error);
  }
}
