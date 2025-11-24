-- Add age, gender, and color preferences to styled_profiles
ALTER TABLE public.styled_profiles 
ADD COLUMN IF NOT EXISTS age int,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS preferred_colors jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS avoided_colors jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.styled_profiles.age IS 'User age for age-appropriate recommendations';
COMMENT ON COLUMN public.styled_profiles.gender IS 'Gender: male, female, non-binary, unisex';
COMMENT ON COLUMN public.styled_profiles.preferred_colors IS 'Array of preferred color names';
COMMENT ON COLUMN public.styled_profiles.avoided_colors IS 'Array of colors to avoid';

-- Ensure payment_transactions table exists with all necessary fields
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  stripe_session_id text UNIQUE NOT NULL,
  amount int NOT NULL, -- in cents
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending', -- pending, completed, failed
  product_type text NOT NULL, -- 'outfit_unlock' or 'credits'
  outfit_id uuid REFERENCES public.generated_outfits(id),
  credits_purchased int,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_session_id ON public.payment_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_outfit_id ON public.payment_transactions(outfit_id);

-- Add RLS policies for payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() = user_id);
