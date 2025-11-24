-- Add links_unlocked column to generated_outfits if it doesn't exist
DO $$ 
BEGIN
    -- Add links_unlocked column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_outfits' 
        AND column_name = 'links_unlocked'
    ) THEN
        ALTER TABLE generated_outfits 
        ADD COLUMN links_unlocked BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added links_unlocked column to generated_outfits';
    ELSE
        RAISE NOTICE 'links_unlocked column already exists';
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_generated_outfits_links_unlocked 
ON generated_outfits(user_id, links_unlocked);

-- Show all columns to verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'generated_outfits'
ORDER BY ordinal_position;
