-- ==========================================
-- SCHEMA ENHANCEMENTS FOR MISSING FEATURES
-- ==========================================
-- Run this script to add missing fields and the styled_profile table

-- ADD MISSING FIELDS TO generated_outfits
ALTER TABLE public.generated_outfits 
ADD COLUMN IF NOT EXISTS why_it_works text,
ADD COLUMN IF NOT EXISTS stylist_notes jsonb,
ADD COLUMN IF NOT EXISTS total_price numeric(10,2);

-- CREATE STYLED_PROFILE TABLE (Centralized user measurements/preferences)
CREATE TABLE IF NOT EXISTS public.styled_profiles (
  user_id uuid references public.profiles(id) primary key,
  
  -- Physical Attributes
  height_cm numeric(5,2), -- e.g., 175.50
  weight_kg numeric(5,2),
  body_type text, -- "athletic", "slim", "curvy", "plus-size"
  face_shape text, -- "oval", "round", "square", "heart"
  skin_tone text, -- "fair", "medium", "olive", "dark"
  
  -- Style Preferences (Defaults that can be changed per quiz)
  default_budget text, -- "Under $500", "$500-$1000", "Luxury"
  default_occasion text, -- "Casual", "Business", "Formal"
  preferred_colors jsonb, -- ["black", "navy", "white"]
  avoided_colors jsonb,
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS FOR STYLED_PROFILES
ALTER TABLE public.styled_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own styled profile" ON public.styled_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own styled profile" ON public.styled_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own styled profile" ON public.styled_profiles FOR UPDATE USING (auth.uid() = user_id);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON public.generated_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON public.generated_outfits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_user_product ON public.product_interactions(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.style_quizzes(user_id);
