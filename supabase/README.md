# Supabase Setup Guide for Paygent

Paygent uses **Supabase (PostgreSQL)** natively for database storage, real-time events, and agent state!

---

## 🚀 How to Set Up Supabase in 2 Minutes

### Step 1: Run the Complete SQL Script in Supabase
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project (e.g., `paygent`).
3. Open the **SQL Editor** from the left navigation.
4. Copy the entire contents of [`supabase/full_setup.sql`](file:///d:/PAYGENT/supabase/full_setup.sql) and paste it into the SQL Editor.
5. Click **Run** (or `Ctrl + Enter`).

This single script creates:
- All **24 tables** with foreign keys, constraints, and cascade delete rules.
- Exact financial decimal types (`NUMERIC(12, 2)`).
- JSONB columns for capabilities, tools, and citations.
- Automatic `updated_at` timestamp triggers.
- Full initial seed data (7 autonomous agents, 2 companies, 10 sponsor integrations, and the reference project).

---

### Step 2: Configure Environment Variables

1. In your Supabase Dashboard, go to **Project Settings** → **API**.
2. Copy your **Project URL** and **anon / public key** (and optionally the **service_role key**).
3. In your `.env` or `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

### Step 3: Run the App
```bash
npm install
npm run dev
```

> **Zero-Config Fallback**: Even without connecting a live Supabase instance right away, Paygent includes a built-in in-memory database fallback pre-seeded with all 7 agents, 2 companies, and 10 sponsor adapters. This means you or your friend can clone/unzip, run `npm install && npm run dev`, and immediately experience the entire autonomous economy out of the box!
