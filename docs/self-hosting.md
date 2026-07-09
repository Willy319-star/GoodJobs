# GoodJobs Self-Hosting Guide

This guide is written for the next AI Agent or engineer who needs to deploy GoodJobs on one Linux server with both the web app and the database/Auth stack.

GoodJobs is not a plain PostgreSQL-only app. It uses Supabase Auth, Supabase SSR cookies, Row Level Security policies, and `auth.uid()` in SQL. If you want the frontend and database on the same server, deploy a self-hosted Supabase stack plus the Next.js app on that server.

## 1. Target Architecture

Recommended single-server layout:

```txt
Internet
  |
  | HTTPS
  v
Reverse proxy: Caddy or Nginx
  |-- app.goodjobs.example.com  -> Next.js GoodJobs app, port 3000
  |-- supabase.goodjobs.example.com -> Supabase Kong/API, usually port 8000
  |-- studio.goodjobs.example.com   -> Supabase Studio, optional/admin only

Same VPS / same LAN
  |-- GoodJobs Next.js app
  |-- Supabase self-hosted services
      |-- PostgreSQL
      |-- Auth
      |-- Realtime
      |-- REST/PostgREST
      |-- Storage, optional
      |-- Studio, optional
```

Minimum server suggestion:

- Ubuntu 22.04 or 24.04 LTS
- 2 CPU cores
- 4 GB RAM minimum, 8 GB preferred
- 40 GB disk minimum
- Docker + Docker Compose
- A domain name with DNS pointing to the server

## 2. Important Deployment Decision

There are two valid paths:

1. Keep Supabase Cloud, self-host only the Next.js app.
   This is simpler and recommended for early users.

2. Self-host Supabase and the Next.js app on the same server.
   This keeps app and database on one server, but operations become your responsibility: backups, security updates, SMTP, JWT secrets, database health, and log monitoring.

This guide covers path 2.

## 3. Files In This Repo That Matter

```txt
README.md
package.json
next.config.ts
middleware.ts
src/lib/supabase/
src/lib/actions/
src/lib/data/applications.ts
src/types/database.ts
supabase/migrations/
```

Database migrations must be applied in order:

```txt
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_fix_existing_profiles.sql
supabase/migrations/0003_allow_custom_application_fields.sql
supabase/migrations/0004_remove_favorite_status.sql
supabase/migrations/0005_add_job_track.sql
supabase/migrations/0006_add_reminder_read_at.sql
```

## 4. Prepare The Server

Run these on the server:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git ufw
```

Install Docker using Docker's official instructions for Ubuntu. After Docker is installed:

```bash
docker --version
docker compose version
```

Open HTTP/HTTPS:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 5. Clone GoodJobs

```bash
mkdir -p /opt/goodjobs
cd /opt/goodjobs
git clone https://github.com/Willy319-star/GoodJobs.git app
cd app
```

Install dependencies and verify build:

```bash
npm ci
npm run lint
npm run build
```

## 6. Deploy Self-Hosted Supabase

Use the official Supabase self-hosting Docker setup as the source of truth. The AI Agent should fetch the latest official Supabase Docker Compose template from Supabase's self-hosting documentation, because service images and environment variables change over time.

Recommended folder:

```txt
/opt/goodjobs/supabase/
```

Example workflow:

```bash
cd /opt/goodjobs
git clone --depth 1 https://github.com/supabase/supabase.git supabase-source
mkdir -p supabase
cp -r supabase-source/docker/* supabase/
cd supabase
cp .env.example .env
```

Then edit `/opt/goodjobs/supabase/.env`.

Required values to set carefully:

```env
POSTGRES_PASSWORD=use-a-long-random-password
JWT_SECRET=use-a-long-random-secret-at-least-32-chars
ANON_KEY=generated-from-JWT_SECRET
SERVICE_ROLE_KEY=generated-from-JWT_SECRET
SITE_URL=https://app.goodjobs.example.com
API_EXTERNAL_URL=https://supabase.goodjobs.example.com
```

Also configure SMTP for Auth emails:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_ADMIN_EMAIL=
SMTP_SENDER_NAME=GoodJobs
```

If SMTP is not configured, email login/sign-up flows may not work correctly.

Start Supabase:

```bash
docker compose up -d
docker compose ps
```

Check logs if services are unhealthy:

```bash
docker compose logs -f
```

## 7. Apply GoodJobs Database Migrations

After Supabase Postgres is healthy, apply migrations in order.

Option A: use Supabase Studio SQL editor:

1. Open `https://studio.goodjobs.example.com`
2. Open SQL Editor
3. Run every file in `supabase/migrations/` in numeric order

Option B: use `psql` on the server:

```bash
cd /opt/goodjobs/app
```

Find the Postgres container name:

```bash
docker ps --format "table {{.Names}}\t{{.Image}}"
```

Then run each SQL file against the Supabase Postgres container. Adjust container name if needed:

```bash
cat supabase/migrations/0001_initial_schema.sql | docker exec -i supabase-db psql -U postgres -d postgres
cat supabase/migrations/0002_fix_existing_profiles.sql | docker exec -i supabase-db psql -U postgres -d postgres
cat supabase/migrations/0003_allow_custom_application_fields.sql | docker exec -i supabase-db psql -U postgres -d postgres
cat supabase/migrations/0004_remove_favorite_status.sql | docker exec -i supabase-db psql -U postgres -d postgres
cat supabase/migrations/0005_add_job_track.sql | docker exec -i supabase-db psql -U postgres -d postgres
cat supabase/migrations/0006_add_reminder_read_at.sql | docker exec -i supabase-db psql -U postgres -d postgres
```

Verify tables:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected tables include:

```txt
applications
interviews
profiles
reminders
timeline_events
```

## 8. Configure GoodJobs Environment Variables

Create `/opt/goodjobs/app/.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.goodjobs.example.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-self-hosted-supabase-anon-key
```

Do not put `SERVICE_ROLE_KEY` in any `NEXT_PUBLIC_` variable.

For local testing on the server before reverse proxy:

```bash
cd /opt/goodjobs/app
npm run build
npm run start
```

Open:

```txt
http://SERVER_IP:3000/login
```

## 9. Run GoodJobs With Docker Compose

Create `/opt/goodjobs/app/Dockerfile` if the repo does not already have one:

```Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Create `/opt/goodjobs/app/docker-compose.yml`:

```yaml
services:
  goodjobs-web:
    build: .
    container_name: goodjobs-web
    restart: unless-stopped
    env_file:
      - .env.production
    ports:
      - "3000:3000"
```

Start it:

```bash
cd /opt/goodjobs/app
docker compose up -d --build
docker compose logs -f goodjobs-web
```

## 10. Reverse Proxy

Caddy example:

```Caddyfile
app.goodjobs.example.com {
  reverse_proxy 127.0.0.1:3000
}

supabase.goodjobs.example.com {
  reverse_proxy 127.0.0.1:8000
}

studio.goodjobs.example.com {
  reverse_proxy 127.0.0.1:3001
}
```

For production, restrict Studio access:

- Put Studio behind VPN, basic auth, or an IP allowlist
- Do not expose database ports publicly
- Only expose 80/443

## 11. Auth Redirect URLs

In Supabase Auth settings, configure:

```txt
Site URL:
https://app.goodjobs.example.com

Additional Redirect URLs:
https://app.goodjobs.example.com/**
```

If local testing is needed:

```txt
http://localhost:3000/**
http://127.0.0.1:3000/**
```

## 12. Smoke Test Checklist

After deployment:

1. Open `https://app.goodjobs.example.com/login`
2. Sign up or log in
3. Create one application
4. Change its status from timeline page
5. Create one reminder
6. Open the notification bell
7. Switch between `秋招` and `实习`
8. Refresh `/dashboard`, `/applications`, `/timeline`, `/calendar`
9. Confirm no Next.js runtime error appears
10. Confirm Supabase `profiles` row is created for the user

Run:

```bash
docker compose logs --tail=200 goodjobs-web
```

Check Supabase logs:

```bash
cd /opt/goodjobs/supabase
docker compose logs --tail=200
```

## 13. Backup Plan

At minimum, back up PostgreSQL daily.

Example:

```bash
mkdir -p /opt/goodjobs/backups
docker exec supabase-db pg_dump -U postgres -d postgres > /opt/goodjobs/backups/goodjobs-$(date +%F).sql
```

Store backups outside the server as well:

- Object storage
- Another server
- Encrypted cloud drive

Also back up:

```txt
/opt/goodjobs/supabase/.env
/opt/goodjobs/app/.env.production
```

Never commit these env files to GitHub.

## 14. Upgrade Process

Before upgrading:

```bash
cd /opt/goodjobs/app
git pull
npm ci
npm run lint
npm run build
```

Apply new SQL migrations if any were added.

Then restart:

```bash
docker compose up -d --build
```

For Supabase stack upgrades, follow official Supabase self-hosting release notes. Do not blindly pull new images without a database backup.

## 15. Common Problems

### Login works locally but fails on server

Check:

- `NEXT_PUBLIC_SUPABASE_URL`
- Supabase `SITE_URL`
- Auth redirect URLs
- Reverse proxy HTTPS headers
- Browser cookies

### Application insert fails with foreign key error

The `profiles` row may be missing. Run:

```sql
insert into public.profiles (id, email)
select users.id, coalesce(users.email, '')
from auth.users
left join public.profiles profiles on profiles.id = users.id
where profiles.id is null;
```

This is already included in `0002_fix_existing_profiles.sql`.

### RLS blocks data

GoodJobs expects authenticated Supabase users. Check:

```sql
select auth.uid();
```

inside an authenticated request context, and verify table policies from `0001_initial_schema.sql`.

### Website cannot connect to Supabase

From the server:

```bash
curl -I https://supabase.goodjobs.example.com
```

From the browser, check Network tab for Supabase API errors.

## 16. Security Notes

- Do not expose Postgres directly to the internet
- Do not commit `.env`, `.env.local`, `.env.production`, Supabase secret keys, or SMTP passwords
- Protect Supabase Studio
- Use HTTPS only in production
- Use long random values for Postgres password and JWT secret
- Rotate keys if they were ever pasted into public chat, logs, screenshots, or GitHub

## 17. What The Next AI Agent Should Do First

1. Read this file completely.
2. Read `README.md`.
3. Inspect `supabase/migrations/` and confirm every migration was applied.
4. Inspect current `.env.production` on the server, but never print secrets.
5. Run `npm run lint` and `npm run build`.
6. Check Docker container status.
7. Run the smoke test checklist.
8. Only then change deployment configuration.

