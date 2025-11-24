-- ==========================================
-- PAYMENT TRANSACTIONS TABLE
-- ==========================================
-- This table tracks all Stripe payments for audit purposes
-- Run this in your Supabase SQL Editor

create table if not exists public.payment_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  stripe_session_id text unique not null,
  stripe_payment_intent_id text,
  amount_cents int not null, -- Amount in cents (500 = $5.00)
  currency text default 'usd',
  payment_type text check (payment_type in ('outfit_unlock', 'credit_purchase')),
  metadata jsonb, -- Store outfit_id or credit amount
  status text check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.payment_transactions enable row level security;

-- Policies
create policy "Users can view own transactions" 
  on public.payment_transactions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own transactions" 
  on public.payment_transactions for insert 
  with check (auth.uid() = user_id);

-- Index for faster lookups
create index if not exists idx_payment_transactions_user_id 
  on public.payment_transactions(user_id);

create index if not exists idx_payment_transactions_session_id 
  on public.payment_transactions(stripe_session_id);
