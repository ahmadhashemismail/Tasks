import { createClient } from "@supabase/supabase-js";

// server only: never import this file from a "use client" component
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase env variables are missing");
  return createClient(url, key, { auth: { persistSession: false } });
}