# Knot — Alumni

Mobile-first alumni network: register a detailed profile (skills + industries), then search and connect with members. Admins manage lookups, events, and alerts.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase Auth + Postgres

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migrations in order:
   - [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)
   - [`supabase/migrations/002_avatars.sql`](supabase/migrations/002_avatars.sql) (if you already ran `001` before avatars existed)
   - [`supabase/migrations/003_admin_events.sql`](supabase/migrations/003_admin_events.sql) — roles, events, alerts, admin write policies
3. Copy your project URL and anon key from **Settings → API**.

### 3. Environment

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAILS=you@email.com
```

`ADMIN_EMAILS` is a comma-separated list. Those addresses can open `/admin` in the UI after sign-in. Row Level Security cannot read this env var, so **writes** (create/update/delete) still require `profiles.role = 'admin'`.

### 4. First admin

1. Sign up and complete your profile.
2. In the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@email.com';
```

3. Optionally add the same address to `ADMIN_EMAILS` so you can reach `/admin` even before the SQL update (the panel will remind you to promote the role).

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flows

| Route | Access |
|-------|--------|
| `/` | Public landing (hero + public events/alerts). Signed-in users with a profile go to `/directory` |
| `/auth/sign-up`, `/auth/sign-in` | Public auth |
| `/onboarding` | Signed-in; first-time profile |
| `/directory` | Signed-in members with a profile (active alerts strip) |
| `/directory/[id]` | Alumni detail |
| `/profile` | Edit own profile |
| `/events` | Signed-in feed: active alerts + upcoming public and member events |
| `/events/[id]` | Event detail. Public events are open; member-only events redirect guests to sign-in |
| `/admin` | Admins: industries, skills, events, alerts |

Anyone can register. Only signed-in members can search the directory. Public events and alerts appear on the landing page.

## Profile fields

- Avatar (photo upload to Supabase Storage, initials fallback)
- Name, headline, bio, graduation year, location
- Primary industry
- Multi-select skills (Technical / Soft / Domain)
- Contact: email (from auth), phone, LinkedIn

If you already ran `001_init.sql`, also run [`supabase/migrations/002_avatars.sql`](supabase/migrations/002_avatars.sql) for avatar column + storage, then [`supabase/migrations/003_admin_events.sql`](supabase/migrations/003_admin_events.sql) for admin, events, and alerts.

## Events, alerts, and Google Drive

- **Alerts**: title, body, optional link, start/end, visibility (`public` or `members`).
- **Events**: title, description, start, optional end/location, visibility, optional Google Drive URL.
- Items with `ends_at` in the past stay in admin but drop off public and member feeds.
- Drive folder or file share links are embedded on the event page. Use **Anyone with the link** (viewer) or the iframe will be blank. If the URL cannot be parsed, the page shows an “Open in Google Drive” link instead.
