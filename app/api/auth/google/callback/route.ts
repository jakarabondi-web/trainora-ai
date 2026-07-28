import { env } from "cloudflare:workers";
import { audit, database, id, now } from "../../../../../lib/server/trainora-store";
import { createSession } from "../../../../../lib/server/session-auth";

type GoogleToken = { access_token?: string; id_token?: string; error?: string };
type GoogleProfile = { sub: string; email: string; email_verified: boolean; name?: string };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stored = readCookie(request.headers.get("cookie") ?? "", "__Host-trainora_oauth");
  const [expectedState, expectedNonce] = stored?.split(".") ?? [];
  if (!code || !state || !expectedState || state !== expectedState) {
    return Response.redirect(new URL("/login?error=oauth_state", request.url));
  }
  const callback = new URL("/api/auth/google/callback", request.url).toString();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: String(env.GOOGLE_CLIENT_ID),
      client_secret: String(env.GOOGLE_CLIENT_SECRET),
      redirect_uri: callback,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenResponse.json() as GoogleToken;
  if (!tokenResponse.ok || !tokens.id_token) {
    return Response.redirect(new URL("/login?error=oauth_exchange", request.url));
  }
  const validationResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokens.id_token)}`);
  const profile = await validationResponse.json() as GoogleProfile & { aud?: string; nonce?: string };
  if (!validationResponse.ok || !profile.email_verified || profile.aud !== String(env.GOOGLE_CLIENT_ID) || profile.nonce !== expectedNonce) {
    return Response.redirect(new URL("/login?error=oauth_validation", request.url));
  }
  const db = database();
  const timestamp = now();
  let user = await db.prepare("SELECT id, role FROM users WHERE email = ?").bind(profile.email.toLowerCase()).first() as { id: string; role: string } | null;
  if (!user) {
    const userId = id("user");
    await db.prepare(
      `INSERT INTO users (id, email, full_name, role, email_verified_at, status, created_at, updated_at)
       VALUES (?, ?, ?, 'applicant', ?, 'active', ?, ?)`,
    ).bind(userId, profile.email.toLowerCase(), profile.name || profile.email, timestamp, timestamp, timestamp).run();
    user = { id: userId, role: "applicant" };
  } else {
    await db.prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?), updated_at = ? WHERE id = ?")
      .bind(timestamp, timestamp, user.id).run();
  }
  const session = await createSession(user.id, "google_oidc", "federated");
  await audit(user.id, "auth.google.success", "user", user.id, { providerSubject: profile.sub });
  const returnTo = user.role === "admin" || user.role === "super_admin" ? "/admin" : "/trainer";
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(returnTo, request.url).toString(),
      "Set-Cookie": [session.cookie, "__Host-trainora_oauth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"].join(", "),
      "Cache-Control": "no-store",
    },
  });
}

function readCookie(cookieHeader: string, name: string) {
  const item = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1) : null;
}
