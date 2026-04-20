
-- Add images array column to parking_locations
ALTER TABLE public.parking_locations 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Create storage bucket for parking images
INSERT INTO storage.buckets (id, name, public)
VALUES ('parking-images', 'parking-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view parking images
CREATE POLICY "Anyone can view parking images"
ON storage.objects FOR SELECT
USING (bucket_id = 'parking-images');

-- Authenticated users can upload parking images
CREATE POLICY "Authenticated users can upload parking images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'parking-images');

-- Users can update their own parking images
CREATE POLICY "Users can update own parking images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'parking-images');

-- Users can delete their own parking images
CREATE POLICY "Users can delete own parking images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'parking-images');
