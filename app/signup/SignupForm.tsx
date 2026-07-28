"use client";

import { FormEvent, useState } from "react";

export function SignupForm() {
  const [role, setRole] = useState<"trainer" | "client">("trainer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(form.entries()), role }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Account creation failed.");
      window.location.assign(role === "trainer" ? "/apply" : "/client");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Account creation failed.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="authForm" onSubmit={submit}>
    <h1>Create your account</h1>
    <p>Choose the workspace you need. You can add roles later.</p>
    {error && <div className="applicationMessage" role="alert">{error}</div>}
    <div className="authRoleToggle">
      <button type="button" className={role === "trainer" ? "selected" : ""} onClick={() => setRole("trainer")}>I&apos;m a trainer</button>
      <button type="button" className={role === "client" ? "selected" : ""} onClick={() => setRole("client")}>I&apos;m an AI company</button>
    </div>
    <label><span>Full name</span><input name="fullName" required autoComplete="name"/></label>
    <label><span>Email</span><input name="email" type="email" required autoComplete="email"/></label>
    <label><span>Password</span><input name="password" type="password" minLength={8} required autoComplete="new-password"/></label>
    {role === "client" && <label><span>Organization name</span><input name="organizationName" required placeholder="Acme AI Labs"/></label>}
    <button className="primaryApplicationAction" disabled={busy}>{busy ? "Creating account…" : "Create account →"}</button>
  </form>;
}
