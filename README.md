# Knot — Alumni

Mobile-first alumni network: register a detailed profile (skills + industries), then search and connect with members.

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
2. In the SQL Editor, run the migration in [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).
3. Copy your project URL and anon key from **Settings → API**.

### 3. Environment

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flows

| Route | Access |
|-------|--------|
| `/` | Landing (redirects signed-in users) |
| `/auth/sign-up`, `/auth/sign-in` | Public auth |
| `/onboarding` | Signed-in; first-time profile |
| `/directory` | Signed-in members with a profile |
| `/directory/[id]` | Alumni detail |
| `/profile` | Edit own profile |

Anyone can register. Only signed-in members can search and view the directory.

## Profile fields

- Avatar (photo upload to Supabase Storage, initials fallback)
- Name, headline, bio, graduation year, location
- Primary industry
- Multi-select skills (Technical / Soft / Domain)
- Contact: email (from auth), phone, LinkedIn

If you already ran `001_init.sql`, also run [`supabase/migrations/002_avatars.sql`](supabase/migrations/002_avatars.sql) for avatar column + storage.
