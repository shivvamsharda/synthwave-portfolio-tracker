-- Add token price and 24h price change columns to portfolio table
ALTER TABLE public.portfolio 
ADD COLUMN token_price NUMERIC DEFAULT 0,
ADD COLUMN price_change_24h NUMERIC DEFAULT 0;