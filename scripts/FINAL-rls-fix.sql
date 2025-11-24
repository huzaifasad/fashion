-- FINAL RLS FIX: Ensure all policies are correct and the column exists

-- 1. Ensure links_unlocked column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generated_outfits' AND column_name = 'links_unlocked'
  ) THEN
    ALTER TABLE generated_outfits ADD COLUMN links_unlocked BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 2. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can update their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can view their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can insert their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON payment_transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON payment_transactions;

-- 3. Create fresh policies for generated_outfits
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

-- 4. Create fresh policies for payment_transactions
CREATE POLICY "Users can insert their own transactions" ON payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Verify everything
SELECT 
  'Column exists:' as status,
  column_name, 
  data_type, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'generated_outfits' AND column_name = 'links_unlocked';

SELECT 
  'RLS Policies:' as status,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('generated_outfits', 'payment_transactions')
ORDER BY tablename, policyname;
