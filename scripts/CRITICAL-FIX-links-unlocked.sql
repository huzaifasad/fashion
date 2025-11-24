-- ============================================
-- CRITICAL FIX: Add links_unlocked column and fix RLS
-- Run this in your Supabase SQL Editor NOW
-- ============================================

-- 1. Add the missing links_unlocked column to generated_outfits
ALTER TABLE generated_outfits 
ADD COLUMN IF NOT EXISTS links_unlocked BOOLEAN DEFAULT FALSE;

-- 2. Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_outfits_links_unlocked 
ON generated_outfits(links_unlocked);

-- 3. Fix RLS policies for generated_outfits table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can insert their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can update their own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can delete their own outfits" ON generated_outfits;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own outfits" 
ON generated_outfits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfits" 
ON generated_outfits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" 
ON generated_outfits FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits" 
ON generated_outfits FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Ensure RLS is enabled
ALTER TABLE generated_outfits ENABLE ROW LEVEL SECURITY;

-- 5. Fix payment_transactions RLS (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their own transactions" ON payment_transactions;
        DROP POLICY IF EXISTS "Users can insert their own transactions" ON payment_transactions;
        
        -- Create new policies
        CREATE POLICY "Users can view their own transactions" 
        ON payment_transactions FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own transactions" 
        ON payment_transactions FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
        
        -- Enable RLS
        ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Verification query - run this to check if everything worked
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'generated_outfits' 
  AND column_name = 'links_unlocked';
