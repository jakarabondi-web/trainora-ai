import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { database, id, now } from "./trainora-store";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  applicationStatus: string | null;
  currentStage: string | null;
  accessTier: string | null;
  mfaLevel: string;
};

const COOKIE_NAME = "__Host-trainora_session";

export async function getSessionUser(): Promise<SessionUser | null> {
  const requestHeaders = await headers();
  const token = readCookie(requestHeaders.get("cookie") ?? "", COOKIE_NAME);
  if (!token) return null;
  const hash = await sha256(token);
  const record = await database().prepare(
    `SELECT u.id, u.email, u.full_name, u.role, u.status, s.mfa_level,
      a.application_status, a.current_stage, a.access_tier
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN applicants a ON a.user_id = u.id
     WHERE s.token_hash = ? AND s.expires_at > ? AND u.status = 'active'`,
  ).bind(hash, now()).first() as Record<string, unknown> | null;
  if (!record) return null;
  return {
    id: String(record.id),
    email: String(record.email),
    fullName: String(record.full_name),
    role: String(record.role),
    status: String(record.status),
    applicationStatus: record.application_status ? String(record.application_status) : null,
    currentStage: record.current_stage ? String(record.current_stage) : null,
    accessTier: record.access_tier ? String(record.access_tier) : null,
    mfaLevel: String(record.mfa_level),
  };
}

export async function createSession(userId: string, authMethod: string, mfaLevel = "single_factor") {
  const token = randomToken(32);
  const createdAt = now();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60_000).toISOString();
  await database().prepare(
    `INSERT INTO auth_sessions
     (id, user_id, token_hash, auth_method, mfa_level, expires_at, last_seen_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id("session"), userId, await sha256(token), authMethod, mfaLevel, expiresAt, createdAt, createdAt).run();
  return {
    token,
    cookie: `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`,
  };
}

export function googleAuthConfigured() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function randomToken(bytes: number) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...data)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readCookie(cookieHeader: string, name: string) {
  const item = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1) : null;
}
