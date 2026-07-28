import { chatGPTSignInPath } from "../chatgpt-auth";
import { googleAuthConfigured } from "../../lib/server/session-auth";

export const metadata={title:"Secure sign in · Trainora AI"};

export default async function LoginPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const params=await searchParams;
  const googleReady=googleAuthConfigured();
  const error=errorMessage(params.error);
  return <main className="loginPage">
    <header><a className="portalBrand darkLogo" href="/"><i>t</i><span>trainora<b>ai</b></span></a><a href="/apply">New expert? Apply</a></header>
    <section className="loginShell">
      <div className="loginStory">
        <small>SECURE ACCOUNT ACCESS</small>
        <h1>One identity.<br/><em>Evidence-based access.</em></h1>
        <p>Signing in confirms who you are. It does not bypass the expert approval process or expose restricted projects.</p>
        <div>{[
          ["01","Secure authentication","Google OpenID Connect or protected platform sign-in"],
          ["02","Step-up protection","MFA is required for administrators and sensitive project access"],
          ["03","Role enforcement","Applicant, trainer, client, and administrator permissions are checked server-side"],
          ["04","Auditable sessions","Short-lived sessions, secure cookies, revocation, and sign-in audit events"],
        ].map(([n,title,detail])=><article key={n}><i>{n}</i><p><b>{title}</b><span>{detail}</span></p></article>)}</div>
      </div>
      <div className="loginCard">
        <div><small>WELCOME BACK</small><h2>Sign in to Trainora</h2><p>Use the same verified email as your application.</p></div>
        {error&&<p className="loginError">{error}</p>}
        <a className={`googleLogin ${googleReady?"":"disabled"}`} aria-disabled={!googleReady} href={googleReady?"/api/auth/google/start":"/login?error=google_not_configured"}>
          <GoogleMark/> Continue with Google
        </a>
        <a className="platformLogin" href={chatGPTSignInPath("/trainer")}>Continue with secure platform sign-in</a>
        <div className="loginDivider"><span>new applicant</span></div>
        <a className="applicationLogin" href="/apply">Create an expert application →</a>
        <div className="loginSecurity"><b>Protected by layered security</b><p><span>✓</span> HttpOnly secure session cookies</p><p><span>✓</span> OAuth state and nonce validation</p><p><span>✓</span> Time-limited sessions and audit history</p><p><span>✓</span> Approval-gated trainer access</p></div>
        {!googleReady&&<p className="loginConfig">Google sign-in is built and will activate when the production Google client ID and secret are added. It is intentionally not simulated.</p>}
      </div>
    </section>
  </main>
}
function GoogleMark(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z"/><path fill="#34a853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#fbbc05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 9l3.4-2.6Z"/><path fill="#ea4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 5.9 12 5.9Z"/></svg>}
function errorMessage(code?:string){
  if(code==="google_not_configured")return "Google sign-in awaits the production OAuth credentials listed in the launch checklist.";
  if(code==="oauth_state")return "The sign-in request expired or could not be validated. Please try again.";
  if(code==="oauth_exchange"||code==="oauth_validation")return "Google could not validate this sign-in. No session was created.";
  return "";
}
