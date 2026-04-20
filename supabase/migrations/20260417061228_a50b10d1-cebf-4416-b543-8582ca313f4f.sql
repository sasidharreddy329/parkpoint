-- 1) Allow owners to update bookings on their locations (mark as completed)
CREATE POLICY "Owners can update location bookings"
ON public.bookings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.parking_locations
  WHERE parking_locations.id = bookings.location_id
    AND parking_locations.owner_id = auth.uid()
));

-- 2) Index for fast overlap queries
CREATE INDEX IF NOT EXISTS idx_bookings_slot_time
  ON public.bookings (slot_id, status, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_bookings_location_time
  ON public.bookings (location_id, status, start_time, end_time);

-- 3) Server-side overlap check + insert booking atomically
CREATE OR REPLACE FUNCTION public.create_booking(
  _slot_id uuid,
  _location_id uuid,
  _start_time timestamptz,
  _end_time timestamptz,
  _total_price numeric,
  _vehicle_number text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _new_id uuid;
  _conflict int;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _end_time <= _start_time THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  IF _start_time < now() - interval '5 minutes' THEN
    RAISE EXCEPTION 'Cannot book in the past';
  END IF;

  -- Lock conflicting check
  SELECT count(*) INTO _conflict
  FROM public.bookings
  WHERE slot_id = _slot_id
    AND status = 'active'
    AND tstzrange(start_time, end_time, '[)') && tstzrange(_start_time, _end_time, '[)');

  IF _conflict > 0 THEN
    RAISE EXCEPTION 'Slot is already booked for the selected time';
  END IF;

  INSERT INTO public.bookings (
    user_id, slot_id, location_id, start_time, end_time, total_price, vehicle_number, status
  ) VALUES (
    _user_id, _slot_id, _location_id, _start_time, _end_time, _total_price, _vehicle_number, 'active'
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

-- 4) Get unavailable slot ids for a location/time window (overlap-aware)
CREATE OR REPLACE FUNCTION public.get_unavailable_slots(
  _location_id uuid,
  _start_time timestamptz,
  _end_time timestamptz
)
RETURNS TABLE(slot_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT b.slot_id
  FROM public.bookings b
  WHERE b.location_id = _location_id
    AND b.status = 'active'
    AND tstzrange(b.start_time, b.end_time, '[)') && tstzrange(_start_time, _end_time, '[)');
$$;

-- 5) Trigger to keep bookings.updated_at fresh
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();