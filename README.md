# Trainora AI Intelligence Platform

A premium, responsive Trainora AI experience with role-based dashboards for
platform administrators, trainers, reviewers, and clients.

## Included routes

- `/` — public Trainora AI homepage
- `/login`, `/signup` — standalone email/password authentication (also works embedded in ChatGPT via the trusted header, whichever is present)
- `/admin` — super-admin operations and quality analytics
- `/trainer` — trainer workspace: jobs marketplace, task workspace (claim/submit), real earnings/payouts, applications
- `/reviewer` — reviewer workspace, wired to a real review queue that pays trainers on approval
- `/client` — client workspace: organizations, projects, task creation, billing/invoices
- `/apply` — trainer application and prescreening flow
- `/api/admin/analytics` — demo analytics API used by illustrative admin charts (see `/api/admin/operations-analytics` for live figures)

## Standalone auth

The app supports two auth paths at once: embedded in ChatGPT (auth comes from a
trusted header) and standalone (`/signup`, `/login`, session cookie backed by
the `sessions` table). `lib/server/current-user.ts` is the single place that
resolves "who is signed in" across both paths — always use `getCurrentUser()`
rather than checking either path directly.

## Run locally

The Vercel-compatible Next.js development server:

```bash
npm install
npm run dev:vercel
```

Open [http://localhost:3000](http://localhost:3000).

The existing OpenAI Sites/vinext development server is still available:

```bash
npm run dev
```

## Deploy with GitHub and Vercel

1. Create an empty GitHub repository.
2. Upload or push this project to the repository.
3. In Vercel, choose **Add New → Project** and import that repository.
4. Keep the detected framework as **Next.js**.
5. Deploy. `vercel.json` automatically selects the standard Next.js build.

No environment variables are required for this design/demo build.

## Production backend checklist

Applicant vetting, jobs, task workspace, earnings/payouts, client projects,
reviewer decisions, support tickets, and disputes are all backed by D1 tables
and real API routes — none of the four portals (trainer/client/reviewer/admin)
are static mockups anymore. Before handling real customers, still connect:

- a real payout provider (Stripe Connect, Wise, etc.) — `/api/trainer/payouts`
  currently marks a payout `processing` and settles the underlying earnings,
  but nothing actually moves money yet;
- secure file/object storage (already wired for identity documents via R2;
  extend the same pattern for task-submission attachments if needed);
- production email delivery (Resend key) and identity verification
  (Stripe Identity key) — both already integrated, just need production keys;
- rate limiting on the standalone auth endpoints and the public API surface;
- audit logging, monitoring, and incident alerting beyond the existing
  `audit_events` table and ad hoc call sites.

Never treat client-side role labels as authorization. Enforce permissions again
on every server action and API endpoint.

## Build verification

```bash
npm run build:vercel
npm run build
```
