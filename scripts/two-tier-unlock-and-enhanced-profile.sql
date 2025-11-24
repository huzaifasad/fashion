-- ==========================================
-- TWO-TIER UNLOCK SYSTEM + ENHANCED PROFILE
-- ==========================================

-- Step 1: Add links_unlocked field to generated_outfits
ALTER TABLE public.generated_outfits 
ADD COLUMN IF NOT EXISTS links_unlocked boolean DEFAULT false;

-- Step 2: Update styled_profiles with more fields
ALTER TABLE public.styled_profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS style_preferences jsonb, -- ["elegant", "casual", "edgy"]
ADD COLUMN IF NOT EXISTS preferred_occasions jsonb; -- ["business", "casual", "formal"]

COMMENT ON COLUMN public.styled_profiles.gender IS 'User gender: male, female, non-binary, prefer-not-to-say';
COMMENT ON COLUMN public.styled_profiles.style_preferences IS 'Array of preferred style tags';
COMMENT ON COLUMN public.styled_profiles.preferred_occasions IS 'Array of default occasions';

-- Step 3: Create Stripe webhook tracking table
CREATE TABLE IF NOT EXISTS public.stripe_webhooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  payment_intent_id text,
  session_id text,
  status text NOT NULL,
  metadata jsonb,
  processed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_id ON public.stripe_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_session_id ON public.stripe_webhooks(session_id);

-- Step 4: Update payment_transactions to link to outfit or credit purchase
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS outfit_id uuid REFERENCES public.generated_outfits(id),
ADD COLUMN IF NOT EXISTS credits_purchased int;

COMMENT ON COLUMN public.payment_transactions.outfit_id IS 'If purchasing outfit link unlock';
COMMENT ON COLUMN public.payment_transactions.credits_purchased IS 'If purchasing credits';
