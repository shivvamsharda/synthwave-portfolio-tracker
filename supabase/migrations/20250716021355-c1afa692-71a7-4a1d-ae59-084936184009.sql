-- Create storage bucket for platform logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('platform-logos', 'platform-logos', true);

-- Create RLS policies for platform logos bucket
CREATE POLICY "Anyone can view platform logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'platform-logos');

CREATE POLICY "Authenticated users can upload platform logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'platform-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.extension(name) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']))
);

CREATE POLICY "Users can update their own platform logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'platform-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own platform logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'platform-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);