-- SQL commands to create indexes on your zara_cloth table
-- Run these in your Supabase SQL Editor to dramatically improve query performance

-- Index for product_name searches (most common)
CREATE INDEX IF NOT EXISTS idx_zara_cloth_product_name_trgm ON zara_cloth USING gin (product_name gin_trgm_ops);

-- Index for category searches
CREATE INDEX IF NOT EXISTS idx_zara_cloth_category_trgm ON zara_cloth USING gin (category gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_zara_cloth_scraped_category_trgm ON zara_cloth USING gin (scraped_category gin_trgm_ops);

-- Index for price range filtering
CREATE INDEX IF NOT EXISTS idx_zara_cloth_price ON zara_cloth (price);

-- Index for ordering by created_at
CREATE INDEX IF NOT EXISTS idx_zara_cloth_created_at ON zara_cloth (created_at DESC);

-- Enable the pg_trgm extension (trigram matching for faster LIKE/ILIKE queries)
-- This needs to be run first if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Composite index for common query pattern (price + category)
CREATE INDEX IF NOT EXISTS idx_zara_cloth_price_category ON zara_cloth (price, category);

-- Alternative: If you want full-text search (even faster), create a tsvector column
-- This is optional but recommended for best performance
ALTER TABLE zara_cloth ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update the search vector with product name and category
UPDATE zara_cloth SET search_vector = 
  to_tsvector('english', coalesce(product_name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(scraped_category, ''));

-- Create index on the search vector
CREATE INDEX IF NOT EXISTS idx_zara_cloth_search_vector ON zara_cloth USING gin (search_vector);

-- Create a trigger to keep search_vector updated automatically
CREATE OR REPLACE FUNCTION zara_cloth_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.product_name, '') || ' ' || coalesce(NEW.category, '') || ' ' || coalesce(NEW.scraped_category, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvector_update BEFORE INSERT OR UPDATE ON zara_cloth
FOR EACH ROW EXECUTE FUNCTION zara_cloth_search_vector_update();
