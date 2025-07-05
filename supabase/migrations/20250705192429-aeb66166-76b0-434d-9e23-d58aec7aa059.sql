-- Fix token metadata policies for better access
DROP POLICY IF EXISTS "Authenticated users can insert token metadata" ON public.token_metadata;
DROP POLICY IF EXISTS "Authenticated users can update token metadata" ON public.token_metadata;

-- Create more permissive policies for token metadata operations
CREATE POLICY "Anyone can insert token metadata" 
ON public.token_metadata 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update token metadata" 
ON public.token_metadata 
FOR UPDATE 
USING (true);