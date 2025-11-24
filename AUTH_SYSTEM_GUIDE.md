# 🔐 Authentication System Guide

## Overview

BuyTheLook uses Supabase Auth for user authentication with email/password and email verification. This guide explains the complete authentication flow and how to configure it for production.

---

## 🏗️ Architecture

### Database Structure

**Auth Database** (`kzitfiqhgdhshavaivyg.supabase.co`):
- `auth.users` - Supabase managed user accounts
- `public.profiles` - Extended user profile with credits (default: 10)
- `public.generated_outfits` - User's outfit collections
- `public.style_quizzes` - User's style preferences

### Key Components

1. **AuthProvider** (`components/auth-provider.jsx`)
   - React Context that wraps the entire app
   - Provides: `user`, `signIn`, `signUp`, `signOut`, `loading`
   - Listens to Supabase auth state changes

2. **Header** (`components/header.jsx`)
   - Displays user info and credits from database
   - Shows profile dropdown with Sign Out
   - Only shows credits when user is authenticated

3. **Login Page** (`app/login/page.jsx`)
   - Simple email/password form
   - Redirects to home on success

4. **Signup Page** (`app/signup/page.jsx`)
   - Email, password, and full name form
   - Checks for duplicate accounts
   - Shows email confirmation message

5. **Auth Callback** (`app/auth/callback/route.ts`)
   - Handles email verification links
   - Exchanges auth code for session

---

## 🔄 Authentication Flow

### Sign Up Flow

\`\`\`
User fills form → signUp() called
    ↓
Check if email exists in profiles
    ↓ (not exists)
Supabase auth.signUp()
    ↓
Trigger: on_auth_user_created fires
    ↓
Create profile with 10 free credits
    ↓
Send verification email (if enabled)
    ↓
User clicks email link → /auth/callback
    ↓
Exchange code for session
    ↓
Redirect to home (authenticated)
\`\`\`

### Sign In Flow

\`\`\`
User enters credentials → signIn() called
    ↓
Supabase auth.signInWithPassword()
    ↓
Session created & stored
    ↓
AuthProvider updates user state
    ↓
Redirect to home
    ↓
Header fetches credits from profiles table
\`\`\`

### Sign Out Flow

\`\`\`
User clicks Sign Out → signOut() called
    ↓
Supabase auth.signOut()
    ↓
Session cleared
    ↓
AuthProvider sets user to null
    ↓
Redirect to home
\`\`\`

---

## ⚙️ Configuration

### 1. Environment Variables

Add these to your `.env.local` or Vercel project settings:

\`\`\`env
# Auth Database
NEXT_PUBLIC_SUPABASE_AUTH_URL=https://kzitfiqhgdhshavaivyg.supabase.co
NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY=eyJhbGci...
SUPABASE_AUTH_SERVICE_ROLE_KEY=sb_secret_...

# Email Verification Redirect
NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL=https://yourdomain.com/auth/callback
\`\`\`

### 2. Supabase Dashboard Setup

#### Enable Email Confirmation (Optional but Recommended)

1. Go to **Authentication → Providers → Email**
2. Enable **"Confirm email"**
3. Set **Site URL** to your production domain: `https://yourdomain.com`
4. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

#### Custom Email Templates

Go to **Authentication → Email Templates** to customize:

- **Confirm signup**: Email verification message
- **Reset password**: Password reset email
- **Magic link**: (if you add magic link auth later)

**Example Confirm Signup Template:**

\`\`\`html
<h2>Welcome to BuyTheLook!</h2>
<p>Click the link below to verify your email:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>
\`\`\`

### 3. Custom Domain Setup

#### For Production with Custom Domain:

1. **In Supabase Dashboard:**
   - Go to **Project Settings → API**
   - Note your project URL and anon key
   - Go to **Authentication → URL Configuration**
   - Set **Site URL**: `https://yourdomain.com`
   - Add **Redirect URLs**: `https://yourdomain.com/auth/callback`

2. **In Your Code:**
   - Update `NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL` to your domain
   - Deploy to Vercel/production

3. **Test the Flow:**
   - Sign up with a real email
   - Check inbox for verification email
   - Click link (should redirect to your domain)
   - Should be logged in automatically

---

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS policies that restrict access:

\`\`\`sql
-- Users can only see their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

-- Users can only update their own profile
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);
\`\`\`

### Service Role Key

The `SUPABASE_AUTH_SERVICE_ROLE_KEY` bypasses RLS:
- **ONLY** used in server-side API routes (`lib/supabase-admin.ts`)
- **NEVER** exposed to the client
- Used for: payment verification, admin operations

---

## 🐛 Troubleshooting

### Issue: "Invalid Refresh Token" error

**Cause:** User session expired or corrupted

**Fix:**
\`\`\`javascript
// Clear localStorage and reload
localStorage.clear()
window.location.reload()
\`\`\`

### Issue: Credits not showing in header

**Cause:** Profile not created or RLS policy blocking

**Fix:**
1. Check if profile exists:
   \`\`\`sql
   SELECT * FROM profiles WHERE id = 'user-uuid';
   \`\`\`
2. If missing, run:
   \`\`\`sql
   INSERT INTO profiles (id, full_name, credits)
   VALUES ('user-uuid', 'Name', 10);
   \`\`\`

### Issue: "User already exists" but can't log in

**Cause:** Email not verified (if confirmation enabled)

**Fix:** 
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user and click "Send recovery email"
3. Or manually set `email_confirmed_at` in the dashboard

### Issue: Header shows credits before login

**Cause:** Old localStorage credits showing

**Fix:** Already fixed! Header now only shows credits when `user` exists and fetches from database.

---

## 📝 Database Triggers

### Auto-create Profile on Signup

When a user signs up, a database trigger automatically creates their profile:

\`\`\`sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, credits)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    10  -- Default 10 free credits
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
\`\`\`

This ensures every user starts with 10 credits automatically.

---

## 🚀 Production Checklist

- [ ] Set `NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL` to production domain
- [ ] Enable email confirmation in Supabase dashboard
- [ ] Add custom email templates with your branding
- [ ] Set Site URL and Redirect URLs in Supabase
- [ ] Test signup flow end-to-end
- [ ] Verify RLS policies are working (users can't see other users' data)
- [ ] Ensure service role key is only in server environment variables
- [ ] Test credit system (profile creation, credit deduction)

---

## 💡 Future Enhancements

Potential features to add:

1. **OAuth Providers** (Google, Facebook)
2. **Magic Link** (passwordless login)
3. **Password Reset** flow
4. **2FA** (two-factor authentication)
5. **Profile Picture Upload** using Supabase Storage
6. **Email Preferences** (marketing emails, notifications)

All these can be easily added using Supabase's built-in features!
