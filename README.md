# Trainora AI Intelligence Platform

A premium, responsive Trainora AI experience with role-based dashboards for
platform administrators, trainers, reviewers, and clients.

## Included routes

- `/` — public Trainora AI homepage
- `/admin` — super-admin operations and quality analytics
- `/trainer` — trainer workspace, earnings, tasks, and feedback
- `/reviewer` — reviewer quality-control workspace
- `/client` — client project workspace
- `/apply` — trainer application and prescreening flow
- `/api/admin/analytics` — demo analytics API used by the admin experience

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

The included dashboards use representative demo data and a demo analytics API.
Before handling real customers, connect:

- a production database and migrations;
- role-based authentication and authorization;
- secure file/object storage;
- payment and payout providers;
- email and notification services;
- identity and credential verification;
- audit logging, monitoring, and incident alerting.

Never treat client-side role labels as authorization. Enforce permissions again
on every server action and API endpoint.

## Build verification

```bash
npm run build:vercel
npm run build
```
