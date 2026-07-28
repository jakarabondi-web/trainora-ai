import { getChatGPTUser } from "../../app/chatgpt-auth";
import { database } from "./trainora-store";
import { getSessionUser, type SessionUser } from "./auth";

export type CurrentUser = SessionUser;

/**
 * Two entry points share this app: embedded inside ChatGPT (auth comes from a
 * trusted header) and standalone (auth comes from a session cookie). Callers
 * should never care which one applied.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const chatGPTUser = await getChatGPTUser();
  if (chatGPTUser) {
    const row = await database().prepare(
      "SELECT id, email, full_name, role FROM users WHERE email = ?",
    ).bind(chatGPTUser.email.toLowerCase()).first() as { id: string; email: string; full_name: string; role: string } | null;
    if (row) return { id: row.id, email: row.email, fullName: row.full_name, role: row.role };
  }
  return getSessionUser();
}
