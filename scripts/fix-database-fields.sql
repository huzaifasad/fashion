-- Add missing fields to styled_profiles table if they don't exist
ALTER TABLE styled_profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS preferred_colors TEXT,
ADD COLUMN IF NOT EXISTS avoided_colors TEXT;

-- Add links_unlocked field to generated_outfits table
ALTER TABLE generated_outfits
ADD COLUMN IF NOT EXISTS links_unlocked BOOLEAN DEFAULT false;

-- Create payment_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  payment_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_session_id ON payment_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_generated_outfits_links_unlocked ON generated_outfits(user_id, links_unlocked);
