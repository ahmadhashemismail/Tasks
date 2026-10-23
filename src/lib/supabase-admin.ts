import { createClient } from "@supabase/supabase-js";

// SERVER ONLY: uses the secret key. Never import this file in a "use client" file.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const IMAGE_BUCKET = "tasks";
