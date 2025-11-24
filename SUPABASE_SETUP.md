# Supabase Configuration Guide

This project uses **TWO separate Supabase projects** for different purposes:

## 1. Products Database (Zara Clothing)
**Used for:** `zara_cloth` table - storing product data
**File:** `lib/supabase.js`
**Project URL:** `https://aqkeprwxxsryropnhfvm.supabase.co`

### Environment Variables (Optional - has defaults):
\`\`\`bash
NEXT_PUBLIC_SUPABASE_PRODUCTS_URL=https://aqkeprwxxsryropnhfvm.supabase.co
NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus
\`\`\`

---

## 2. Auth/User Database
**Used for:** User authentication, `generated_outfits`, `user_preferences`, `profiles`, payment transactions
**Files:** `lib/supabase-auth-client.js`, `lib/supabase-server.ts`
**Project URL:** `https://kzitfiqhgdhshavaivyg.supabase.co`

### Environment Variables (Optional - has defaults):
\`\`\`bash
NEXT_PUBLIC_SUPABASE_AUTH_URL=https://kzitfiqhgdhshavaivyg.supabase.co
NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aXRmaXFoZ2Roc2hhdmFpdnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzUzNzUsImV4cCI6MjA3MzYxMTM3NX0.4J6IJYGWO66qGuPcR8tv-qRo88edJPJ-vuzdQvbg_Jc
SUPABASE_AUTH_SERVICE_ROLE_KEY=sb_secret_myj39s6OhsdH5Ks91GebWg_08SUoK2P
\`\`\`

**⚠️ IMPORTANT:** The `SUPABASE_AUTH_SERVICE_ROLE_KEY` is needed for:
- Payment verification (bypassing RLS)
- Stripe webhooks
- Admin operations

---

## How It Works

### Products Database Client
\`\`\`javascript
import { supabase } from "@/lib/supabase"
// Use for zara_cloth queries
const { data } = await supabase.from("zara_cloth").select("*")
\`\`\`

### Auth Database Client
\`\`\`javascript
import { supabaseAuth } from "@/lib/supabase-auth-client"
// Use for user-related queries
const { data } = await supabaseAuth.from("generated_outfits").select("*")
\`\`\`

### Admin Client (Server-Side Only)
\`\`\`javascript
import { supabaseAdmin } from "@/lib/supabase-auth-client"
// Use for operations that need to bypass RLS (payments, webhooks)
const { data } = await supabaseAdmin.from("generated_outfits").update({ links_unlocked: true })
\`\`\`

---

## Why Two Databases?

1. **Separation of Concerns:** Product catalog vs user data
2. **Different RLS Policies:** Products are public, user data is private
3. **Scalability:** Each database can scale independently
4. **Security:** User data is isolated from public product data

---

## Adding Environment Variables in Vercel

1. Go to your Vercel project
2. Click "Settings" → "Environment Variables"
3. Add the variables above (if you want to override defaults)
4. Redeploy your project

---

## Quick Reference

| What You're Doing | Import This | Database |
|-------------------|-------------|----------|
| Query products (zara_cloth) | `import { supabase } from "@/lib/supabase"` | Products DB |
| Query user data (client) | `import { supabaseAuth } from "@/lib/supabase-auth-client"` | Auth DB |
| Admin operations (server) | `import { supabaseAdmin } from "@/lib/supabase-auth-client"` | Auth DB |
| Server components with auth | `import { createSupabaseServerClient } from "@/lib/supabase-server"` | Auth DB |

---

## Troubleshooting

**Error: "supabaseKey is required"**
- Check that environment variables are set correctly
- Make sure you're using the right client for the right database

**Error: "Auth session missing"**
- Use `supabaseAdmin` instead of `supabaseAuth` in API routes that don't have user context (webhooks, etc.)

**Error: "PGRST116 - 0 rows"**
- RLS policies are blocking the operation
- Use `supabaseAdmin` to bypass RLS for trusted server operations
