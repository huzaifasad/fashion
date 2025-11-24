import { createClient } from "@supabase/supabase-js"

// This bypasses RLS and must be kept secret
const SUPABASE_AUTH_URL = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL
const SUPABASE_AUTH_SERVICE_KEY = process.env.SUPABASE_AUTH_SERVICE_ROLE_KEY

if (!SUPABASE_AUTH_URL || !SUPABASE_AUTH_SERVICE_KEY) {
  // Warn on server side
  console.warn("[v0] Supabase Admin: Missing environment variables.")
}

export const supabaseAdmin = createClient(
  SUPABASE_AUTH_URL || "https://placeholder.supabase.co",
  SUPABASE_AUTH_SERVICE_KEY || "placeholder",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
