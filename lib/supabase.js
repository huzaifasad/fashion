import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY

console.log("[v0] Supabase Products: Initializing client")

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[v0] Supabase Products: Missing environment variables.")
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("https://placeholder.supabase.co", "placeholder")

console.log("[v0] Supabase Products: Client created successfully")
