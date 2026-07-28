"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Sign in failed.");
      window.location.assign("/roles");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="authForm" onSubmit={submit}>
    <h1>Sign in</h1>
    <p>Access your trainer, client, or admin workspace.</p>
    {error && <div className="applicationMessage" role="alert">{error}</div>}
    <label><span>Email</span><input name="email" type="email" required autoComplete="email"/></label>
    <label><span>Password</span><input name="password" type="password" required autoComplete="current-password"/></label>
    <button className="primaryApplicationAction" disabled={busy}>{busy ? "Signing in…" : "Sign in →"}</button>
  </form>;
}
