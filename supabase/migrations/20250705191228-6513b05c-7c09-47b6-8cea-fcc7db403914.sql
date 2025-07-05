-- Add token metadata columns to portfolio table
ALTER TABLE public.portfolio 
ADD COLUMN logo_uri TEXT,
ADD COLUMN description TEXT,
ADD COLUMN website TEXT,
ADD COLUMN twitter TEXT;