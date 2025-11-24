-- Fix payment_transactions table schema
-- Drop the old table if it has wrong schema
DROP TABLE IF EXISTS payment_transactions CASCADE;

-- Recreate with correct schema
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('links_unlock', 'credits_purchase')),
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions"
  ON payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update transactions"
  ON payment_transactions
  FOR UPDATE
  USING (true);

-- Indexes for performance
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_session_id ON payment_transactions(stripe_session_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- Ensure other required columns exist
ALTER TABLE styled_profiles 
ADD COLUMN IF NOT EXISTS preferred_colors TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS avoided_colors TEXT DEFAULT '';

ALTER TABLE generated_outfits
ADD COLUMN IF NOT EXISTS links_unlocked BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_generated_outfits_links_unlocked ON generated_outfits(user_id, links_unlocked);
