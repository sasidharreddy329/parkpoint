-- Tighten parking-images SELECT: require authenticated session (prevents anonymous bucket listing)
DROP POLICY IF EXISTS "Anyone can view parking images" ON storage.objects;

CREATE POLICY "Authenticated users can view parking images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'parking-images');