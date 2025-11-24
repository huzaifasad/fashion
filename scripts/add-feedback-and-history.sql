-- Add feedback columns to generated_outfits
ALTER TABLE generated_outfits 
ADD COLUMN IF NOT EXISTS is_liked BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS feedback_text TEXT,
ADD COLUMN IF NOT EXISTS feedback_reason TEXT,
ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster feedback queries
CREATE INDEX IF NOT EXISTS idx_outfits_feedback ON generated_outfits(user_id, is_liked);
