import { database, now } from "./trainora-store";

const assignableRoles = new Set(["trainer", "client", "reviewer", "admin", "applicant"]);

export async function listUsers(filter?: { role?: string; query?: string }) {
  const db = database();
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filter?.role) {
    conditions.push("u.role = ?");
    params.push(filter.role);
  }
  if (filter?.query) {
    conditions.push("(u.email LIKE ? OR u.full_name LIKE ?)");
    params.push(`%${filter.query}%`, `%${filter.query}%`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.prepare(
    `SELECT u.id, u.email, u.full_name, u.role, u.status, u.email_verified_at, u.created_at,
      (SELECT o.name FROM organization_members m JOIN organizations o ON o.id = m.organization_id WHERE m.user_id = u.id LIMIT 1) AS organization_name
     FROM users u ${where} ORDER BY u.created_at DESC LIMIT 200`,
  ).bind(...params).all();
  return result.results ?? [];
}

export async function setUserRole(userId: string, role: string) {
  if (!assignableRoles.has(role)) throw new Error("Unsupported role.");
  await database().prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?")
    .bind(role, now(), userId).run();
}

export async function setUserStatus(userId: string, status: "active" | "suspended") {
  await database().prepare("UPDATE users SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, now(), userId).run();
}
