# GoodJobs

GoodJobs is a campus recruiting application tracker built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Local Development

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000/login.

## Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Use the Supabase Project URL and publishable/anon key. Do not put the Supabase secret key in a `NEXT_PUBLIC_` variable.

## Supabase Database

Run these SQL files in Supabase SQL Editor in order:

```txt
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_fix_existing_profiles.sql
supabase/migrations/0003_allow_custom_application_fields.sql
supabase/migrations/0004_remove_favorite_status.sql
supabase/migrations/0005_add_job_track.sql
supabase/migrations/0006_add_reminder_read_at.sql
supabase/migrations/0007_invite_codes.sql
```

`0002_fix_existing_profiles.sql` fixes users who registered before the `profiles` trigger existed.

GoodJobs sign-up is protected by one-time invite codes. The public migration only creates the
invite-code table and RPC functions. Actual code inserts should stay private. For the initial
beta batch, run the local ignored file `private/invite-codes-20260722.sql` in Supabase SQL Editor.

## Self-Hosting On One Server

If you want to deploy the GoodJobs frontend and the database/Auth stack on the same server, read:

```txt
docs/self-hosting.md
```

GoodJobs uses Supabase Auth, RLS policies, and `auth.uid()`, so a plain PostgreSQL database is not enough unless the app is refactored away from Supabase Auth.

## Deployment To Vercel

1. Push this project to GitHub.
2. Import the GitHub repository in Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.

Build command:

```bash
npm run build
```

Development command:

```bash
npm run dev
```

## Current Product Stage

- Supabase Auth is connected.
- Application CRUD is connected to Supabase.
- Dashboard, timeline, detail page, and reminders read from Supabase.
- Loading, error, and not-found states are present for production readiness.
