# Supabase setup for GoodJobs

Run these files in Supabase SQL Editor in order:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_fix_existing_profiles.sql`

The schema contains:

- `profiles`: application profile tied to `auth.users`
- `applications`: one job application record per company/position
- `timeline_events`: historical events for each application
- `interviews`: interview questions, answers, and review notes
- `reminders`: upcoming written tests, interviews, reviews, and deadlines

Security model:

Every private table has Row Level Security enabled. Users can only read and write their own rows.

Performance model:

The schema indexes foreign keys and common query patterns such as user/status filters, application dates, timeline dates, and upcoming reminders.