-- Fix Row Level Security policies for payment and unlock functionality

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can view their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can insert their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON payment_transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON payment_transactions;

-- GENERATED_OUTFITS POLICIES
CREATE POLICY "Users can view their own outfits" ON generated_outfits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfits" ON generated_outfits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" ON generated_outfits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PAYMENT_TRANSACTIONS POLICIES
CREATE POLICY "Users can insert their own transactions" ON payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'generated_outfits' AND column_name = 'links_unlocked';
