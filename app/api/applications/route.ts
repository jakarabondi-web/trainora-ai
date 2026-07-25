import { apiError, audit, database, id, now } from "../../../lib/server/trainora-store";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    if (!email || !fullName) {
      return Response.json({ error: "Full name and email are required." }, { status: 400 });
    }

    const db = database();
    const timestamp = now();
    const domain = email.split("@")[1] ?? "";
    const disposableDomains = new Set(["mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com"]);
    const emailRisk = disposableDomains.has(domain) ? "needs_review" : "passed";
    const existing = await db.prepare(
      `SELECT a.id, a.user_id FROM applicants a JOIN users u ON u.id = a.user_id WHERE u.email = ?`,
    ).bind(email).first() as { id: string; user_id: string } | null;
    const userId = existing?.user_id ?? id("user");
    const applicantId = existing?.id ?? id("app");

    if (!existing) {
      await db.batch([
        db.prepare(
          `INSERT INTO users (id, email, full_name, role, status, created_at, updated_at)
           VALUES (?, ?, ?, 'applicant', 'active', ?, ?)`,
        ).bind(userId, email, fullName, timestamp, timestamp),
        db.prepare(
          `INSERT INTO applicants
           (id, user_id, discipline, country, years_experience, education, credentials,
            portfolio_url, application_status, current_stage, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'email_verification', ?, ?)`,
        ).bind(
          applicantId,
          userId,
          String(body.discipline ?? ""),
          String(body.country ?? ""),
          Number(body.yearsExperience ?? 0),
          String(body.education ?? ""),
          String(body.credentials ?? ""),
          String(body.portfolioUrl ?? ""),
          timestamp,
          timestamp,
        ),
        db.prepare(
          `INSERT INTO verification_checks
           (id, applicant_id, type, provider, status, score, reason, created_at, updated_at)
           VALUES (?, ?, 'email_domain_risk', 'trainora_rules', ?, ?, ?, ?, ?)`,
        ).bind(id("check"), applicantId, emailRisk, emailRisk === "passed" ? 100 : 25, emailRisk === "passed" ? "Email domain passed baseline risk screening." : "Disposable or high-risk email domain requires review.", timestamp, timestamp),
        db.prepare(
          `INSERT INTO verification_checks
           (id, applicant_id, type, provider, status, score, reason, created_at, updated_at)
           VALUES (?, ?, 'duplicate_account', 'trainora_rules', 'passed', 100, 'No existing account was found for this verified email.', ?, ?)`,
        ).bind(id("check"), applicantId, timestamp, timestamp),
      ]);
    } else {
      await db.batch([
        db.prepare("UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?")
          .bind(fullName, timestamp, userId),
        db.prepare(
          `UPDATE applicants SET discipline = ?, country = ?, years_experience = ?,
           education = ?, credentials = ?, portfolio_url = ?, updated_at = ? WHERE id = ?`,
        ).bind(
          String(body.discipline ?? ""),
          String(body.country ?? ""),
          Number(body.yearsExperience ?? 0),
          String(body.education ?? ""),
          String(body.credentials ?? ""),
          String(body.portfolioUrl ?? ""),
          timestamp,
          applicantId,
        ),
      ]);
    }

    await audit(userId, existing ? "application.updated" : "application.created", "applicant", applicantId);
    return Response.json({ applicantId, userId, status: "draft", nextStage: "email_verification" });
  } catch (error) {
    return apiError(error);
  }
}
