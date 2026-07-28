export const metadata = { title: "Create account · Trainora AI" };
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return <main className="authPage">
    <a className="portalBrand darkLogo" href="/"><i>t</i><span>trainora<b>ai</b></span></a>
    <SignupForm/>
    <p className="authSwitch">Already have an account? <a href="/login">Sign in →</a></p>
  </main>;
}
