-- Remove SELECT policy entirely. Public bucket still serves files via direct URL,
-- but no one can list/enumerate bucket contents.
DROP POLICY IF EXISTS "Authenticated users can view parking images" ON storage.objects;