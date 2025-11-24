-- Add the missing links_unlocked column to generated_outfits table
-- This is required for the $5 payment unlock feature to work

ALTER TABLE generated_outfits 
ADD COLUMN IF NOT EXISTS links_unlocked BOOLEAN DEFAULT FALSE;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_outfits_links_unlocked 
ON generated_outfits(user_id, links_unlocked);

-- Update any existing outfits to set links_unlocked = true where is_unlocked = true
-- (for backward compatibility with old data)
UPDATE generated_outfits 
SET links_unlocked = is_unlocked 
WHERE links_unlocked IS NULL;

-- Add a comment explaining the field
COMMENT ON COLUMN generated_outfits.links_unlocked IS 
'TRUE when user has paid $5 to unlock shopping links for this outfit';
