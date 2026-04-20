-- ParkPoint Supabase bootstrap
-- Run this in Supabase SQL Editor against project: dugspugwesxiqbcnjpdm

-- Create role enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('user', 'owner');
  END IF;
END
$$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, (COALESCE(NEW.raw_user_meta_data->>'role', 'user'))::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Parking locations table
CREATE TABLE IF NOT EXISTS public.parking_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  image_url TEXT,
  price_per_hour NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  total_slots INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  images TEXT[] DEFAULT '{}'
);

ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active locations" ON public.parking_locations;
DROP POLICY IF EXISTS "Anyone can view active locations or owners see own" ON public.parking_locations;
CREATE POLICY "Anyone can view active locations or owners see own" ON public.parking_locations
FOR SELECT USING (is_active = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert locations" ON public.parking_locations;
CREATE POLICY "Owners can insert locations" ON public.parking_locations FOR INSERT WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Owners can update own locations" ON public.parking_locations;
CREATE POLICY "Owners can update own locations" ON public.parking_locations FOR UPDATE USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Owners can delete own locations" ON public.parking_locations;
CREATE POLICY "Owners can delete own locations" ON public.parking_locations FOR DELETE USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'owner'));

-- Parking slots table
CREATE TABLE IF NOT EXISTS public.parking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.parking_locations(id) ON DELETE CASCADE,
  slot_label TEXT NOT NULL,
  slot_type TEXT NOT NULL DEFAULT 'standard',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view slots" ON public.parking_slots;
CREATE POLICY "Anyone can view slots" ON public.parking_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can insert slots" ON public.parking_slots;
CREATE POLICY "Owners can insert slots" ON public.parking_slots FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.parking_locations WHERE id = location_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owners can update slots" ON public.parking_slots;
CREATE POLICY "Owners can update slots" ON public.parking_slots FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.parking_locations WHERE id = location_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owners can delete slots" ON public.parking_slots;
CREATE POLICY "Owners can delete slots" ON public.parking_slots FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.parking_locations WHERE id = location_id AND owner_id = auth.uid())
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.parking_slots(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.parking_locations(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  vehicle_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can view location bookings" ON public.bookings;
CREATE POLICY "Owners can view location bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.parking_locations WHERE id = location_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can update location bookings" ON public.bookings;
CREATE POLICY "Owners can update location bookings"
ON public.bookings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.parking_locations
  WHERE parking_locations.id = bookings.location_id
    AND parking_locations.owner_id = auth.uid()
));

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_parking_locations_updated_at ON public.parking_locations;
CREATE TRIGGER update_parking_locations_updated_at BEFORE UPDATE ON public.parking_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for parking images
INSERT INTO storage.buckets (id, name, public)
VALUES ('parking-images', 'parking-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view parking images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view parking images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload parking images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own parking images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own parking images" ON storage.objects;

CREATE POLICY "Authenticated users can upload parking images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'parking-images');

CREATE POLICY "Users can update own parking images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'parking-images');

CREATE POLICY "Users can delete own parking images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'parking-images');

-- Booking helper functions and indexes
CREATE INDEX IF NOT EXISTS idx_bookings_slot_time
  ON public.bookings (slot_id, status, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_bookings_location_time
  ON public.bookings (location_id, status, start_time, end_time);

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

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  location_id uuid NOT NULL REFERENCES public.parking_locations(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, location_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users who booked can create reviews" ON public.reviews;
CREATE POLICY "Users who booked can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.user_id = auth.uid()
      AND b.location_id = reviews.location_id
  )
);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_reviews_location ON public.reviews(location_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
