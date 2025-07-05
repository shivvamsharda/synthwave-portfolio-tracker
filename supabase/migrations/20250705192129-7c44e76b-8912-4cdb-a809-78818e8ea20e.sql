-- Create token metadata cache table
CREATE TABLE public.token_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_mint TEXT NOT NULL UNIQUE,
  symbol TEXT,
  name TEXT,
  logo_uri TEXT,
  description TEXT,
  website TEXT,
  twitter TEXT,
  decimals INTEGER,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for fast token lookups
CREATE INDEX idx_token_metadata_mint ON public.token_metadata(token_mint);

-- Enable RLS
ALTER TABLE public.token_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for token metadata (public read, system write)
CREATE POLICY "Token metadata is publicly readable" 
ON public.token_metadata 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert token metadata" 
ON public.token_metadata 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update token metadata" 
ON public.token_metadata 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE TRIGGER update_token_metadata_updated_at
BEFORE UPDATE ON public.token_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();