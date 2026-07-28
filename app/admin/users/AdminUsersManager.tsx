"use client";

import { useEffect, useState } from "react";

type UserRow = { id: string; email: string; full_name: string; role: string; status: string; email_verified_at: string | null; organization_name: string | null; created_at: string };

const roles = ["applicant", "trainer", "client", "reviewer", "admin"];

export function AdminUsersManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const params = query ? `?query=${encodeURIComponent(query)}` : "";
    const response = await fetch(`/api/admin/users${params}`);
    if (response.status === 403) { setNotice("Administrator sign-in is required to manage users."); return; }
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Users are unavailable."); return; }
    setUsers(payload.users ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function updateUser(id: string, body: Record<string, unknown>) {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "The account could not be updated."); return; }
    setNotice("Account updated.");
    await load();
  }

  return <section className="applicantCommand">
    <header>
      <div><small>PEOPLE / ACCOUNTS</small><h2>Users and roles</h2><p>Change a user&apos;s role or suspend an account. Changes take effect immediately.</p></div>
    </header>
    {notice && <div className="jobNotice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    <div className="jobFilters">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email"/>
      <button onClick={() => void load()}>Search</button>
    </div>
    <div className="applicantQueue" style={{ borderRight: 0 }}>
      <div className="queueHeader" style={{ gridTemplateColumns: "1.6fr .8fr .8fr .6fr" }}><b>User</b><b>Role</b><b>Organization</b><b>Status</b></div>
      {users.length ? users.map((user) => <div key={user.id} style={{ display: "grid", gridTemplateColumns: "1.6fr .8fr .8fr .6fr", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #edf1f4" }}>
        <span><b>{user.full_name}</b><br/><small>{user.email}</small></span>
        <select value={user.role} onChange={(event) => void updateUser(user.id, { role: event.target.value })}>
          {roles.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <span>{user.organization_name ?? "—"}</span>
        <button onClick={() => void updateUser(user.id, { status: user.status === "active" ? "suspended" : "active" })}>
          {user.status === "active" ? "Suspend" : "Reactivate"}
        </button>
      </div>) : <div className="adminEmpty"><b>No users found</b><p>Adjust your search or wait for new sign-ups.</p></div>}
    </div>
  </section>;
}
