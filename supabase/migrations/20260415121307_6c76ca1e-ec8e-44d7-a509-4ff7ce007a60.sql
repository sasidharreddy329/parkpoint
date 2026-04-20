
DROP POLICY "Anyone can view active locations" ON public.parking_locations;
CREATE POLICY "Anyone can view active locations or owners see own" ON public.parking_locations 
FOR SELECT USING (is_active = true OR auth.uid() = owner_id);
