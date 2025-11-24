-- ==========================================
-- AUTH SYSTEM VERIFICATION SCRIPT
-- ==========================================
-- Run this to verify your authentication setup is correct

-- 1. Check if profiles table exists and has correct structure
SELECT 
  column_name, 
  data_type, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Expected output:
-- id          | uuid      | 
-- full_name   | text      | 
-- avatar_url  | text      |
-- credits     | integer   | 10
-- created_at  | timestamp | timezone('utc'::text, now())

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'generated_outfits', 'style_quizzes');

-- Expected: All should have rowsecurity = true

-- 3. Check if trigger exists for auto-creating profiles
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Expected: on_auth_user_created | INSERT | users

-- 4. Test profile creation (replace USER_ID with actual UUID)
-- SELECT * FROM profiles WHERE id = 'your-user-id-here';

-- If no results, manually create:
-- INSERT INTO profiles (id, full_name, credits) 
-- VALUES ('your-user-id-here', 'Test User', 10);

-- 5. Check RLS policies for profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Expected policies:
-- - Users can view own profile (SELECT)
-- - Users can update own profile (UPDATE)

-- 6. Verify admin function for handling new users
SELECT 
  proname as function_name,
  prosrc as source_code
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Should return the trigger function that creates profiles
