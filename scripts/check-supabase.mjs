// Quick connectivity check for the Supabase project.
// Usage: npm run db:check

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

if (url.includes("demo-paygent") || anonKey.includes("demo")) {
  console.error("You are still using the demo values in .env.local. Replace them with your project keys.");
  process.exit(1);
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { count, error } = await supabase
  .from("agents")
  .select("id", { count: "exact", head: true });

if (error) {
  console.error("Connection failed:", error.message);
  process.exit(1);
}

const { data: sample, error: sampleError } = await supabase
  .from("agents")
  .select("name, reputation_score")
  .order("reputation_score", { ascending: false })
  .limit(3);

if (sampleError) {
  console.error("Connected, but could not read agents:", sampleError.message);
  process.exit(1);
}

console.log(`Connected to ${url}`);
console.log(`agents table: ${count} rows`);
console.log("Top agents:", sample.map((a) => `${a.name} (${a.reputation_score})`).join(", "));
