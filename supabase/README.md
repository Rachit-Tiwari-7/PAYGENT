# Supabase Setup + Sign-In Guide

This folder contains **one SQL file** that builds the entire Paygent database from scratch:

| File | Purpose |
|---|---|
| `setup.sql` | Drops/recreates all 24 tables, enables RLS, creates the auth profile trigger, and seeds agents/companies/integrations. |
| `README.md` | This guide. |

> **Important:** the app currently reads from an in-memory data layer (`lib/supabase.ts`). The SQL below gives you a real database and real auth; wiring the app's data layer to it is a separate step.

---

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard).
2. Click **New project**.
3. Pick a region close to you, set a database password, and create it.
4. Wait for the project to finish provisioning (about 1 minute).

Free tier gives you 2 projects, a 500 MB database, 50,000 monthly active auth users, and 5 GB egress. That is plenty for this project.

---

## 2. Run the database script

1. In the dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/setup.sql`, copy **everything**, paste it into the editor.
4. Click **Run** (or `Ctrl + Enter`).

> **Warning:** this script drops and recreates every Paygent table. It is intended for a fresh project. Re-running it erases existing Paygent data.

The script is wrapped in a transaction. If anything fails, nothing is applied.

At the end you should see a result like:

| profiles | companies | agents | projects | total_debits | total_credits | ledger_balance |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 2 | 7 | 0 | 0.00 | 0.00 | 0.00 |

`projects` stays `0` until you sign up (see step 3) and re-run the optional demo block, or create a project in the app.

### What gets created

- `profiles` – one row per Supabase Auth user.
- `companies`, `agents`, `agent_skills`, `agent_memories`, `agent_versions`, `company_members`
- `projects`, `tasks`, `task_dependencies`
- `bids`, `negotiations`
- `contracts`, `contract_events`
- `deliverables`, `evaluations`, `disputes`
- `transactions`, `ledger_entries`, `payment_events`
- `reputation_events`, `agent_messages`
- `integrations`, `automation_events`
- Two helper views: `v_ledger_totals` and `v_project_summary`.

---

## 3. Turn on sign-in

### Email + password (fastest)

1. Go to **Authentication → Providers → Email**.
2. Make sure **Enable Email provider** is on.
3. For local development, turn **Confirm email** off. That way `signUp()` logs the user in immediately.
4. For production, turn confirmation back on and configure your SMTP settings under **Authentication → Emails**.

### Google (optional)

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Web application).
2. Add this authorized redirect URI:

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

3. Copy the Client ID and Client Secret into **Authentication → Providers → Google** and enable it.

---

## 4. Configure URLs

Go to **Authentication → URL Configuration**.

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:**
  ```
  http://localhost:3000/**
  http://localhost:3000/auth/callback
  ```
- Add your production domain later, e.g. `https://your-app.com/**`.

If these are missing, email links and OAuth redirects will bounce to the wrong place.

---

## 5. Add environment variables

In the dashboard, go to **Project Settings → API** and copy:

- Project URL
- `anon` / public key
- `service_role` / secret key

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
```

- `NEXT_PUBLIC_*` values are safe in the browser.
- `SUPABASE_SERVICE_ROLE_KEY` must **never** be sent to the browser. It bypasses RLS and belongs only in server code.
- If your project uses the newer **publishable / secret** keys, use those in the same slots.

---

## 6. Install the Next.js auth helpers

```bash
npm install @supabase/supabase-js @supabase/ssr
```

`@supabase/supabase-js` is already in the project; this makes sure `@supabase/ssr` is present too.

### Browser client — `lib/supabase/client.ts`

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server client — `lib/supabase/server.ts`

This project uses Next.js 14, so `cookies()` is synchronous.

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component; safe to ignore.
          }
        },
      },
    }
  );
}
```

---

## 7. Add a sign-in page

Create `app/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            // Only CLIENT or DEVELOPER is accepted from signup metadata.
            role: "CLIENT",
          },
        },
      });

      if (error) setMessage(error.message);
      else {
        setMessage("Account created. Check your email if confirmation is enabled.");
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>{mode === "signin" ? "Sign in" : "Create account"}</h1>

      {mode === "signup" && (
        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
      </button>

      <button type="button" onClick={handleGoogle}>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Need an account?" : "Already have an account?"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
```

Add a sign-out button anywhere:

```tsx
const supabase = createClient();
await supabase.auth.signOut();
window.location.href = "/login";
```

---

## 8. OAuth callback (only needed for Google/OAuth)

Create `app/auth/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

---

## 9. Refresh sessions with middleware

Create `middleware.ts` in the project root:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Example protection: send signed-out users to /login.
  // Uncomment if you want the whole app protected.
  // if (!user && !request.nextUrl.pathname.startsWith("/login")) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## 10. What happens on sign-up

The SQL installs a trigger on `auth.users`:

```
auth.users INSERT
   └─> handle_new_user()
        └─> public.profiles row (same UUID)
```

That profile row stores `email`, `full_name`, `avatar_url`, and `role`. You never need to insert into `profiles` manually.

Sign-up metadata controls the name and role:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: "Rachit", role: "CLIENT" },
  },
});
```

Only `CLIENT` and `DEVELOPER` are accepted from metadata. `ADMIN` and `AUDITOR` must be granted manually:

```sql
update public.profiles
set role = 'ADMIN'
where email = 'you@example.com';
```

---

## 11. Row Level Security summary

| Table(s) | Who can read | Who can write |
|---|---|---|
| `companies`, `agents`, `projects`, `tasks`, `bids`, `contracts`, `deliverables`, `ledger_entries`, etc. | anyone (anon + signed in) | `service_role` only |
| `profiles` | signed-in users | users can update only their own name/avatar |
| `projects` | anyone | owners can insert/update/delete their own rows |

Server-side code should use the **service role key** for writes (API routes, server actions). It bypasses RLS. Never expose it to the client.

If you later add client-side writes, add a policy for that table. Do not disable RLS.

---

## 12. Useful checks

```sql
-- Am I signed in as the right profile?
select auth.uid(), * from public.profiles where id = auth.uid();

-- Ledger status per project (should balance to 0.00)
select * from public.v_ledger_totals;

-- Project overview
select * from public.v_project_summary order by created_at desc;

-- Make a user an admin
update public.profiles set role = 'ADMIN' where email = 'you@example.com';
```

---

## 13. Free-tier tips

- Do not upload files to Storage unless you need to; the free tier is 1 GB.
- Keep the seed data as-is; it is a few KB.
- Supabase free projects pause after about 7 days of inactivity. Open the dashboard or hit the app to wake them.
- Free tier includes 500 MB database and 5 GB egress; this schema will use well under 1 MB.
- Avoid polling the database from the browser. Use server components or API routes.

---

## 14. Troubleshooting

| Problem | Fix |
|---|---|
| `relation "profiles" does not exist` | You did not run `setup.sql`, or it failed. Re-run the whole file. |
| Sign-up succeeds but no profile row | Check **Database → Triggers** for `on_auth_user_created` on `auth.users`. Re-run the trigger section of the script. |
| `new row violates row-level security policy` | You are writing with the anon key. Use the service role key on the server, or add an RLS policy for that operation. |
| Email link redirects to `localhost:3000` in production | Add your production URL under **Authentication → URL Configuration**. |
| OAuth gives `redirect_uri_mismatch` | The Google redirect URI must be exactly `https://<project-ref>.supabase.co/auth/v1/callback`. |
| Auth session disappears after refresh | Add the middleware from step 9 so cookies are refreshed. |
| `permission denied for table profiles` | Run the grants section again, or check that you are using the anon key with a signed-in session. |

---

## 15. Next step: wire the app to the database

Right now `lib/supabase.ts` exports an in-memory `db` object, so the UI runs without any database. To use Supabase for real, the data layer needs to be replaced with Supabase queries (or Prisma pointed at the Supabase connection string).

Once the SQL is run and auth works, that is the next piece to build.
