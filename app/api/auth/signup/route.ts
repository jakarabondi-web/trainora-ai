import { apiError, audit, database, id, now } from "../../../../lib/server/trainora-store";
import { createSession, hashPassword } from "../../../../lib/server/auth";

const allowedRoles = new Set(["trainer", "client"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string; fullName?: string; role?: string; organizationName?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const password = String(body.password ?? "");
    const role = allowedRoles.has(String(body.role)) ? String(body.role) : "trainer";
    if (!email || !fullName || password.length < 8) {
      return Response.json({ error: "Full name, email, and a password of at least 8 characters are required." }, { status: 400 });
    }
    if (role === "client" && !String(body.organizationName ?? "").trim()) {
      return Response.json({ error: "An organization name is required for a client account." }, { status: 400 });
    }
    const db = database();
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first() as { id: string } | null;
    if (existing) return Response.json({ error: "An account already uses this email." }, { status: 409 });

    const timestamp = now();
    const userId = id("user");
    const passwordHash = await hashPassword(password);
    const statements = [
      db.prepare(
        `INSERT INTO users (id, email, full_name, role, password_hash, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
      ).bind(userId, email, fullName, role, passwordHash, timestamp, timestamp),
    ];

    let organizationId: string | undefined;
    if (role === "client") {
      organizationId = id("org");
      const slugBase = String(body.organizationName).toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-+|-+$/g, "") || "client";
      const slug = `${slugBase}-${organizationId.slice(-6)}`;
      statements.push(
        db.prepare("INSERT INTO organizations (id, name, slug, created_by, created_at) VALUES (?, ?, ?, ?, ?)")
          .bind(organizationId, String(body.organizationName).trim(), slug, userId, timestamp),
        db.prepare("INSERT INTO organization_members (id, organization_id, user_id, role, created_at) VALUES (?, ?, ?, 'owner', ?)")
          .bind(id("orgmember"), organizationId, userId, timestamp),
      );
    }
    await db.batch(statements);
    await audit(userId, "user.signed_up", "user", userId, { role });
    await createSession(userId);
    return Response.json({ id: userId, email, role, organizationId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
