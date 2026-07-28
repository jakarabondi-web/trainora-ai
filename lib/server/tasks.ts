import { database, id, notify, now } from "./trainora-store";
import { addEarning } from "./payments";

export async function trainerEligible(trainerId: string) {
  const db = database();
  const applicant = await db.prepare(
    "SELECT application_status FROM applicants WHERE user_id = ?",
  ).bind(trainerId).first() as { application_status: string } | null;
  return applicant?.application_status === "approved";
}

export async function openTasks(discipline?: string) {
  const db = database();
  const result = discipline
    ? await db.prepare(
        `SELECT t.*, p.title AS project_title, p.discipline, p.required_quality_score
         FROM project_tasks t JOIN projects p ON p.id = t.project_id
         WHERE t.status = 'open' AND p.status = 'active' AND p.discipline = ?
         ORDER BY t.created_at DESC`,
      ).bind(discipline).all()
    : await db.prepare(
        `SELECT t.*, p.title AS project_title, p.discipline, p.required_quality_score
         FROM project_tasks t JOIN projects p ON p.id = t.project_id
         WHERE t.status = 'open' AND p.status = 'active'
         ORDER BY t.created_at DESC`,
      ).all();
  return result.results ?? [];
}

export async function myTasks(trainerId: string) {
  const db = database();
  const result = await db.prepare(
    `SELECT t.*, p.title AS project_title,
      (SELECT s.status FROM task_submissions s WHERE s.task_id = t.id ORDER BY s.submitted_at DESC LIMIT 1) AS submission_status,
      (SELECT s.review_notes FROM task_submissions s WHERE s.task_id = t.id ORDER BY s.submitted_at DESC LIMIT 1) AS review_notes
     FROM project_tasks t JOIN projects p ON p.id = t.project_id
     WHERE t.assigned_trainer_id = ? ORDER BY t.updated_at DESC`,
  ).bind(trainerId).all();
  return result.results ?? [];
}

export async function claimTask(trainerId: string, taskId: string) {
  const db = database();
  const task = await db.prepare("SELECT id, status FROM project_tasks WHERE id = ?").bind(taskId).first() as { id: string; status: string } | null;
  if (!task) throw new Error("Task not found.");
  if (task.status !== "open") throw new Error("This task is no longer available.");
  await db.prepare("UPDATE project_tasks SET status = 'assigned', assigned_trainer_id = ?, updated_at = ? WHERE id = ?")
    .bind(trainerId, now(), taskId).run();
}

export async function submitTask(trainerId: string, taskId: string, content: string) {
  const db = database();
  const task = await db.prepare("SELECT id, status, assigned_trainer_id FROM project_tasks WHERE id = ?").bind(taskId).first() as { id: string; status: string; assigned_trainer_id: string | null } | null;
  if (!task || task.assigned_trainer_id !== trainerId) throw new Error("This task is not assigned to you.");
  if (task.status !== "assigned") throw new Error("This task cannot be submitted right now.");
  const timestamp = now();
  await db.batch([
    db.prepare("INSERT INTO task_submissions (id, task_id, trainer_id, content, status, submitted_at) VALUES (?, ?, ?, ?, 'pending', ?)")
      .bind(id("submission"), taskId, trainerId, content, timestamp),
    db.prepare("UPDATE project_tasks SET status = 'submitted', updated_at = ? WHERE id = ?").bind(timestamp, taskId),
  ]);
}

export async function reviewQueue() {
  const db = database();
  const result = await db.prepare(
    `SELECT s.*, t.title AS task_title, t.rate_cents, p.title AS project_title, u.full_name AS trainer_name
     FROM task_submissions s
     JOIN project_tasks t ON t.id = s.task_id
     JOIN projects p ON p.id = t.project_id
     JOIN users u ON u.id = s.trainer_id
     WHERE s.status = 'pending' ORDER BY s.submitted_at`,
  ).all();
  return result.results ?? [];
}

export async function decideSubmission(reviewerId: string, submissionId: string, decision: "approved" | "rejected", notes: string, qualityScore?: number) {
  const db = database();
  const submission = await db.prepare(
    `SELECT s.id, s.task_id, s.trainer_id, t.rate_cents FROM task_submissions s
     JOIN project_tasks t ON t.id = s.task_id WHERE s.id = ? AND s.status = 'pending'`,
  ).bind(submissionId).first() as { id: string; task_id: string; trainer_id: string; rate_cents: number } | null;
  if (!submission) throw new Error("Submission not found or already reviewed.");
  const timestamp = now();
  await db.batch([
    db.prepare(
      "UPDATE task_submissions SET status = ?, reviewer_id = ?, review_notes = ?, quality_score = ?, reviewed_at = ? WHERE id = ?",
    ).bind(decision, reviewerId, notes, qualityScore ?? null, timestamp, submissionId),
    db.prepare("UPDATE project_tasks SET status = ?, updated_at = ?, assigned_trainer_id = ? WHERE id = ?")
      .bind(decision === "approved" ? "approved" : "open", timestamp, decision === "approved" ? submission.trainer_id : null, submission.task_id),
  ]);
  if (decision === "approved") {
    await db.prepare("UPDATE projects SET spent_cents = spent_cents + ?, updated_at = ? WHERE id = (SELECT project_id FROM project_tasks WHERE id = ?)")
      .bind(submission.rate_cents, timestamp, submission.task_id).run();
    await addEarning(submission.trainer_id, "task", submission.task_id, "Approved task submission", submission.rate_cents);
  }
  await notify(submission.trainer_id, "task_review", decision === "approved" ? "Task approved" : "Task needs revision",
    decision === "approved" ? "Your submission was approved and paid to your earnings." : notes, "/trainer#tasks");
}
