-- Add stock_qty column to product_availability
ALTER TABLE product_availability ADD COLUMN IF NOT EXISTS stock_qty integer;

-- Insert review from Pastel Bs As (published immediately)
INSERT INTO product_reviews (id, product_id, reviewer_name, rating, comment, is_published, is_deleted, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'natural-380',
  'Pastel Bs As',
  5,
  'Nos encantó la verdad. Así que apenas se nos termine el pote, nos ponemos en contacto para pedir más 🐒🐒🐒',
  true,
  false,
  now(),
  now()
)
ON CONFLICT DO NOTHING;
