import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, useLocation as useRouterLocation } from "react-router-dom";
import { MapPin, Car, ChevronLeft, ChevronRight, Navigation, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParkingMap from "@/components/map/ParkingMap";
import RouteMap from "@/components/map/RouteMap";
import DateTimePicker from "@/components/booking/DateTimePicker";
import ReviewSection from "@/components/reviews/ReviewSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { today, buildDateTime, formatTimeRange } from "@/lib/booking";

interface ParkingSlot {
  id: string;
  slot_label: string;
  slot_type: string;
  is_available: boolean;
}

const ParkingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { position } = useGeolocation();

  const [location, setLocation] = useState<any>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [date, setDate] = useState(searchParams.get("date") || today());
  const [startHour, setStartHour] = useState(Number(searchParams.get("hour") || new Date().getHours() + 1) % 24);
  const [duration, setDuration] = useState(Number(searchParams.get("duration") || 2));
  const [vehicle, setVehicle] = useState("");
  const [booking, setBooking] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDirections, setShowDirections] = useState(false);

  const startDate = useMemo(() => buildDateTime(date, startHour), [date, startHour]);
  const endDate = useMemo(() => new Date(startDate.getTime() + duration * 3600000), [startDate, duration]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("parking_locations").select("*").eq("id", id).single();
      setLocation(data);
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  useEffect(() => {
    if (!location) return;
    const fetchSlots = async () => {
      const { data } = await supabase.from("parking_slots").select("*").eq("location_id", location.id);
      setSlots(data || []);
    };
    fetchSlots();
  }, [location]);

  // Refresh unavailable slots whenever time changes
  useEffect(() => {
    if (!location) return;
    const fetchUnavailable = async () => {
      const { data } = await supabase.rpc("get_unavailable_slots", {
        _location_id: location.id,
        _start_time: startDate.toISOString(),
        _end_time: endDate.toISOString(),
      });
      setUnavailableIds(new Set((data || []).map((d: any) => d.slot_id)));
    };
    fetchUnavailable();
  }, [location, startDate, endDate]);

  const images: string[] = location?.images?.length > 0
    ? location.images
    : location?.image_url ? [location.image_url] : ["/placeholder.svg"];

  const isSlotBookable = (s: ParkingSlot) => s.is_available && !unavailableIds.has(s.id);
  const availableCount = slots.filter(isSlotBookable).length;
  const selected = slots.find(s => s.id === selectedSlot);
  const total = location ? (location.price_per_hour * duration + 1).toFixed(2) : "0.00";

  const handleBook = async () => {
    if (!user) { toast.error("Please log in"); navigate("/login"); return; }
    if (!selectedSlot || !location) return;
    setBooking(true);

    const { data, error } = await supabase.rpc("create_booking", {
      _slot_id: selectedSlot,
      _location_id: location.id,
      _start_time: startDate.toISOString(),
      _end_time: endDate.toISOString(),
      _total_price: parseFloat(total),
      _vehicle_number: vehicle || null,
    });

    if (error) {
      toast.error(error.message || "Booking failed");
    } else {
      toast.success("Booking confirmed!");
      navigate("/dashboard");
    }
    setBooking(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 text-center text-muted-foreground">Loading...</div></div>
  );
  if (!location) return (
    <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 text-center text-muted-foreground">Location not found</div></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left */}
          <div className="lg:col-span-3 space-y-6">
            {/* Gallery */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
              <AnimatePresence mode="wait">
                <motion.img key={imgIndex} src={images[imgIndex]} alt={location.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((imgIndex - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur rounded-full flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setImgIndex((imgIndex + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur rounded-full flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{location.name}</h1>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{location.address}, {location.city}</span>
              </div>
              {location.lat && location.lng && (
                <Button
                  variant="outline" size="sm" className="mt-3 gap-2"
                  onClick={() => setShowDirections(true)}
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </Button>
              )}
            </div>

            {/* Map */}
            <ParkingMap locations={[location]} selectedLocationId={location.id} className="h-[250px]" />

            {/* Slot Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground">Select a Spot</h2>
                <span className="text-xs text-muted-foreground">{availableCount} of {slots.length} free for chosen time</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {slots.map(slot => {
                  const bookable = isSlotBookable(slot);
                  return (
                    <button
                      key={slot.id}
                      onClick={() => bookable && setSelectedSlot(slot.id)}
                      disabled={!bookable}
                      title={!bookable ? (unavailableIds.has(slot.id) ? "Booked for this time" : "Closed") : ""}
                      className={`aspect-square rounded-lg border-2 text-xs font-medium transition-all flex items-center justify-center ${
                        selectedSlot === slot.id
                          ? "border-primary bg-primary/10 text-primary"
                          : bookable
                          ? "border-border hover:border-primary/40 text-foreground"
                          : "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                      }`}
                    >{slot.slot_label}</button>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-primary rounded" /> Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-border rounded" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-muted border border-border rounded" /> Booked / Closed</span>
              </div>
            </div>
          </div>

          {/* Right: Booking Panel (only for logged-in users) */}
          <div className="lg:col-span-2">
            {user ? (
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 space-y-5">
                <h2 className="text-xl font-bold text-foreground">Book This Spot</h2>

                <DateTimePicker
                  date={date} startHour={startHour} duration={duration}
                  onDateChange={setDate} onStartHourChange={setStartHour} onDurationChange={setDuration}
                />

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Vehicle number (optional)</label>
                  <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="ABC-1234"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spot</span>
                    <span className="font-medium text-foreground">{selected?.slot_label || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">When</span>
                    <span className="text-foreground text-xs text-right">{formatTimeRange(startDate, endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span>${location.price_per_hour}/hr × {duration}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>$1.00</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">${total}</span>
                  </div>
                </div>

                <Button onClick={handleBook} disabled={booking || !selectedSlot}
                  className="w-full rounded-xl py-3 h-auto font-semibold text-base">
                  {booking ? "Booking..." : !selectedSlot ? "Select a spot" : "Confirm Booking →"}
                </Button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Login to Book</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need an account to reserve a parking spot at this location.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/login?redirect=${encodeURIComponent(routerLocation.pathname + routerLocation.search)}`)}
                    className="w-full rounded-xl"
                  >
                    Login to Book
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/signup?redirect=${encodeURIComponent(routerLocation.pathname + routerLocation.search)}`)}
                    className="w-full rounded-xl"
                  >
                    Create an account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews — visible to everyone */}
        <div className="mt-12 max-w-3xl">
          <ReviewSection locationId={location.id} />
        </div>
      </div>

      {/* Directions Modal */}
      <AnimatePresence>
        {showDirections && location.lat && location.lng && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDirections(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><Navigation className="w-5 h-5" /> Directions</h3>
                <button onClick={() => setShowDirections(false)} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <DirectionsContent
                userPos={position}
                destination={{ lat: location.lat, lng: location.lng, name: location.name }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

// Directions sub-component
import AddressSearch from "@/components/map/AddressSearch";

const DirectionsContent = ({ userPos, destination }: {
  userPos: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number; name: string };
}) => {
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(userPos);

  useEffect(() => { if (userPos) setStart(userPos); }, [userPos]);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">From</label>
          {userPos && (
            <button
              onClick={() => setStart(userPos)}
              className={`w-full mb-2 px-3 py-2 rounded-lg border text-xs ${start === userPos ? "border-primary bg-primary/5" : "border-border"}`}
            >📍 My current location</button>
          )}
          <AddressSearch placeholder="Or enter starting point…" onSelect={(r) => setStart({ lat: r.lat, lng: r.lng })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">To</label>
          <div className="px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground">
            🅿️ {destination.name}
          </div>
        </div>
      </div>

      {start ? (
        <RouteMap start={start} end={destination} className="h-[400px]" />
      ) : (
        <div className="h-[400px] rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
          Enable location or enter a starting address to see the route.
        </div>
      )}
    </div>
  );
};

export default ParkingDetail;
