import { apiError, audit, database } from "../../../../lib/server/trainora-store";
import { clearFailedLogins, createSession, registerFailedLogin, verifyPassword } from "../../../../lib/server/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as { email?: string; password?: string };
    const normalized = String(email ?? "").trim().toLowerCase();
    if (!normalized || !password) return Response.json({ error: "Email and password are required." }, { status: 400 });

    const db = database();
    const user = await db.prepare(
      "SELECT id, password_hash, failed_login_count, locked_until, status FROM users WHERE email = ?",
    ).bind(normalized).first() as { id: string; password_hash: string | null; failed_login_count: number; locked_until: string | null; status: string } | null;

    // Same generic error whether the account doesn't exist or the password is
    // wrong, so a login attempt can't be used to discover registered emails.
    const genericError = Response.json({ error: "Incorrect email or password." }, { status: 401 });
    if (!user || !user.password_hash) return genericError;
    if (user.status !== "active") return Response.json({ error: "This account is not active." }, { status: 403 });
    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return Response.json({ error: "Too many failed attempts. Try again in a few minutes." }, { status: 429 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      await registerFailedLogin(user.id, user.failed_login_count);
      return genericError;
    }
    await clearFailedLogins(user.id);
    await createSession(user.id);
    await audit(user.id, "user.signed_in", "user", user.id, {});
    return Response.json({ id: user.id });
  } catch (error) {
    return apiError(error);
  }
}
