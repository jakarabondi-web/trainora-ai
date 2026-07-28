import { cookies } from "next/headers";
import { database, now } from "./trainora-store";

export { hashPassword, verifyPassword } from "./password";

function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const SESSION_COOKIE = "trainora_session";
const SESSION_DAYS = 30;

export type SessionUser = { id: string; email: string; fullName: string; role: string };

export async function createSession(userId: string) {
  const db = database();
  const sessionId = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60_000).toISOString();
  await db.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(sessionId, userId, expiresAt, now()).run();
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession() {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (sessionId) await database().prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const db = database();
  const row = await db.prepare(
    `SELECT u.id, u.email, u.full_name, u.role FROM sessions s
     JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?`,
  ).bind(sessionId, now()).first() as { id: string; email: string; full_name: string; role: string } | null;
  return row ? { id: row.id, email: row.email, fullName: row.full_name, role: row.role } : null;
}

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;

export async function registerFailedLogin(userId: string, currentCount: number) {
  const db = database();
  const nextCount = currentCount + 1;
  const lockedUntil = nextCount >= LOCKOUT_THRESHOLD
    ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString()
    : null;
  await db.prepare("UPDATE users SET failed_login_count = ?, locked_until = ?, updated_at = ? WHERE id = ?")
    .bind(nextCount, lockedUntil, now(), userId).run();
  return lockedUntil;
}

export async function clearFailedLogins(userId: string) {
  await database().prepare("UPDATE users SET failed_login_count = 0, locked_until = NULL, updated_at = ? WHERE id = ?")
    .bind(now(), userId).run();
}
