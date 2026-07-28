export const metadata = { title: "Sign in · Trainora AI" };
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return <main className="authPage">
    <a className="portalBrand darkLogo" href="/"><i>t</i><span>trainora<b>ai</b></span></a>
    <LoginForm/>
    <p className="authSwitch">Don&apos;t have an account? <a href="/signup">Create one →</a></p>
  </main>;
}
