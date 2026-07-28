import { env } from "cloudflare:workers";
import { googleAuthConfigured, randomToken } from "../../../../../lib/server/session-auth";

export async function GET(request: Request) {
  if (!googleAuthConfigured()) {
    return Response.redirect(new URL("/login?error=google_not_configured", request.url));
  }
  const state = randomToken(24);
  const nonce = randomToken(24);
  const callback = new URL("/api/auth/google/callback", request.url).toString();
  const target = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  target.searchParams.set("client_id", String(env.GOOGLE_CLIENT_ID));
  target.searchParams.set("redirect_uri", callback);
  target.searchParams.set("response_type", "code");
  target.searchParams.set("scope", "openid email profile");
  target.searchParams.set("state", state);
  target.searchParams.set("nonce", nonce);
  target.searchParams.set("prompt", "select_account");
  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      "Set-Cookie": `__Host-trainora_oauth=${state}.${nonce}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      "Cache-Control": "no-store",
    },
  });
}
