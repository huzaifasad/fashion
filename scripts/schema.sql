-- ==========================================
-- SUPABASE DATABASE SCHEMA FOR BUY THE LOOK
-- ==========================================
-- Run this entire script in your Supabase SQL Editor to set up all required tables.

-- 1. PROFILES: Stores user credits and info
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  credits int default 10, -- Free credits for new users
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. STYLE_QUIZZES: Stores user preferences and uploaded images
create table if not exists public.style_quizzes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  vision text, -- The text prompt
  budget text,
  occasion text,
  mood text,
  uploaded_image_url text, -- Stores the URL of the image they uploaded
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GENERATED_OUTFITS: Stores the final collections/outfits
create table if not exists public.generated_outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  quiz_id uuid references public.style_quizzes(id), -- Link back to the quiz
  name text not null, -- e.g. "Edgy Chic"
  description text,
  items jsonb not null, -- Stores the full object: {top: {...}, bottom: {...}, shoes: {...}}
  is_unlocked boolean default false, -- True if user spent a credit to unlock links
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PRODUCT_INTERACTIONS: Tracks Dislikes (Never show again) and Purchases
create table if not exists public.product_interactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  product_id text not null, -- The ID from your 'zara_cloth' table
  product_url text, -- Fallback identifier
  interaction_type text check (interaction_type in ('disliked', 'purchased', 'liked')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- SECURITY POLICIES (Row Level Security)
-- ==========================================

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.style_quizzes enable row level security;
alter table public.generated_outfits enable row level security;
alter table public.product_interactions enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Quizzes Policies
create policy "Users can view own quizzes" on public.style_quizzes for select using (auth.uid() = user_id);
create policy "Users can insert own quizzes" on public.style_quizzes for insert with check (auth.uid() = user_id);

-- Outfits Policies
create policy "Users can view own outfits" on public.generated_outfits for select using (auth.uid() = user_id);
create policy "Users can insert own outfits" on public.generated_outfits for insert with check (auth.uid() = user_id);
create policy "Users can update own outfits" on public.generated_outfits for update using (auth.uid() = user_id);

-- Interactions Policies
create policy "Users can view own interactions" on public.product_interactions for select using (auth.uid() = user_id);
create policy "Users can insert own interactions" on public.product_interactions for insert with check (auth.uid() = user_id);

-- ==========================================
-- AUTOMATION TRIGGERS
-- ==========================================

-- Function to handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, credits)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 10);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
