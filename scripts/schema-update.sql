-- Additional fields that might be missing from the original schema
-- Run this AFTER the main schema.sql if you need to add these fields

-- 1. Add 'description' to generated_outfits if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='generated_outfits' AND column_name='description'
  ) THEN
    ALTER TABLE public.generated_outfits ADD COLUMN description text;
  END IF;
END $$;

-- 2. Ensure style_quizzes has all necessary fields
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='style_quizzes' AND column_name='uploaded_image_url'
  ) THEN
    ALTER TABLE public.style_quizzes ADD COLUMN uploaded_image_url text;
  END IF;
END $$;

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_outfits_user_id ON public.generated_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_style_quizzes_user_id ON public.style_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_product_interactions_user_product ON public.product_interactions(user_id, product_id);
