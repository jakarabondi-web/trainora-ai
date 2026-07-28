import { database, id, now } from "./trainora-store";

export async function organizationForUser(userId: string) {
  const db = database();
  const row = await db.prepare(
    `SELECT o.id, o.name, o.slug, m.role FROM organization_members m
     JOIN organizations o ON o.id = m.organization_id WHERE m.user_id = ? ORDER BY m.created_at LIMIT 1`,
  ).bind(userId).first() as { id: string; name: string; slug: string; role: string } | null;
  return row;
}

export async function listProjects(organizationId: string) {
  const db = database();
  const result = await db.prepare(
    `SELECT p.*,
      (SELECT COUNT(*) FROM project_tasks t WHERE t.project_id = p.id) AS task_count,
      (SELECT COUNT(*) FROM project_tasks t WHERE t.project_id = p.id AND t.status IN ('submitted','approved')) AS completed_count
     FROM projects p WHERE p.organization_id = ? ORDER BY p.created_at DESC`,
  ).bind(organizationId).all();
  return result.results ?? [];
}

export async function createProject(organizationId: string, userId: string, input: {
  title: string; description: string; discipline: string; budgetCents: number; requiredQualityScore: number;
}) {
  const db = database();
  const projectId = id("project");
  const timestamp = now();
  await db.prepare(
    `INSERT INTO projects (id, organization_id, title, description, discipline, status, budget_cents, spent_cents, required_quality_score, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, 0, ?, ?, ?, ?)`,
  ).bind(projectId, organizationId, input.title, input.description, input.discipline, input.budgetCents, input.requiredQualityScore, userId, timestamp, timestamp).run();
  return projectId;
}

export async function projectDetail(organizationId: string, projectId: string) {
  const db = database();
  const project = await db.prepare("SELECT * FROM projects WHERE id = ? AND organization_id = ?").bind(projectId, organizationId).first();
  if (!project) return null;
  const tasks = await db.prepare(
    `SELECT t.*, u.full_name AS trainer_name FROM project_tasks t
     LEFT JOIN users u ON u.id = t.assigned_trainer_id WHERE t.project_id = ? ORDER BY t.created_at DESC`,
  ).bind(projectId).all();
  return { project, tasks: tasks.results ?? [] };
}

export async function addProjectTasks(projectId: string, tasks: Array<{ title: string; instructions: string; rateCents: number }>) {
  const db = database();
  const timestamp = now();
  const statements = tasks.map((task) => db.prepare(
    `INSERT INTO project_tasks (id, project_id, title, instructions, rate_cents, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'open', ?, ?)`,
  ).bind(id("task"), projectId, task.title, task.instructions, task.rateCents, timestamp, timestamp));
  if (statements.length) await db.batch(statements);
  return statements.length;
}

export async function listInvoices(organizationId: string) {
  const db = database();
  const result = await db.prepare("SELECT * FROM invoices WHERE organization_id = ? ORDER BY created_at DESC").bind(organizationId).all();
  return result.results ?? [];
}
