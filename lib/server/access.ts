import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../app/chatgpt-auth";
import { getCurrentUser } from "./current-user";

export async function requireAdmin() {
  const chatGPTUser = await getChatGPTUser();
  if (env.DEV_AUTH_BYPASS === "true") {
    return chatGPTUser ?? { email: "local-admin@trainora.ai", displayName: "Local Admin", fullName: "Local Admin" };
  }
  const allowed = String(env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (chatGPTUser) {
    return allowed.includes(chatGPTUser.email.toLowerCase()) ? chatGPTUser : null;
  }
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return null;
  const isAdmin = sessionUser.role === "admin" || allowed.includes(sessionUser.email.toLowerCase());
  return isAdmin ? { email: sessionUser.email, displayName: sessionUser.fullName, fullName: sessionUser.fullName } : null;
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

