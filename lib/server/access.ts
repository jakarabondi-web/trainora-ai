import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../app/chatgpt-auth";

export async function requireAdmin() {
  const user = await getChatGPTUser();
  if (env.DEV_AUTH_BYPASS === "true") {
    return user ?? { email: "local-admin@trainora.ai", displayName: "Local Admin", fullName: "Local Admin" };
  }
  if (!user) return null;
  const allowed = String(env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(user.email.toLowerCase()) ? user : null;
}

export async function adminOnly() {
  const user = await requireAdmin();
  if (!user) {
    return {
      user: null,
      response: Response.json(
        { error: "Administrator authentication is required.", code: "ADMIN_AUTH_REQUIRED" },
        { status: 403 },
      ),
    };
  }
  return { user, response: null };
}

