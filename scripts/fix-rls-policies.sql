-- Fix RLS policies for payment_transactions table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON payment_transactions;
DROP POLICY IF EXISTS "System can update transactions" ON payment_transactions;

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own transactions
CREATE POLICY "Users can view their own transactions" ON payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow all authenticated users to insert transactions (needed for checkout creation)
CREATE POLICY "Authenticated users can insert transactions" ON payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow the system to update transaction status
CREATE POLICY "Users can update their own transactions" ON payment_transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the links_unlocked column exists in generated_outfits
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='generated_outfits' AND column_name='links_unlocked'
  ) THEN
    ALTER TABLE generated_outfits ADD COLUMN links_unlocked BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create an index for faster filtering on links_unlocked
CREATE INDEX IF NOT EXISTS idx_generated_outfits_links_unlocked 
ON generated_outfits(user_id, links_unlocked) 
WHERE links_unlocked = true;
