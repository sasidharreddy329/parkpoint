import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Navigation, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParkingMap from "@/components/map/ParkingMap";
import ParkingCard from "@/components/parking/ParkingCard";
import DateTimePicker from "@/components/booking/DateTimePicker";
import { useGeolocation } from "@/hooks/useGeolocation";
import { haversineDistance, formatDistance } from "@/lib/distance";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { today, buildDateTime } from "@/lib/booking";

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  price_per_hour: number;
  total_slots: number;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  images: string[] | null;
}

const FindParking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { position } = useGeolocation();

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [popular, setPopular] = useState<ParkingLocation[]>([]);
  const [availableMap, setAvailableMap] = useState<Record<string, number>>({});
  const [reviewStats, setReviewStats] = useState<Record<string, { avg: number; count: number }>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100);
  const [maxDistance, setMaxDistance] = useState(50);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Date/time filter
  const [date, setDate] = useState(searchParams.get("date") || today());
  const [startHour, setStartHour] = useState(Number(searchParams.get("hour") || (new Date().getHours() + 1) % 24));
  const [duration, setDuration] = useState(Number(searchParams.get("duration") || 2));

  const startDate = useMemo(() => buildDateTime(date, startHour), [date, startHour]);
  const endDate = useMemo(() => new Date(startDate.getTime() + duration * 3600000), [startDate, duration]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from("parking_locations")
        .select("id, name, address, city, price_per_hour, total_slots, lat, lng, image_url, images")
        .eq("is_active", true);
      const list = (data as ParkingLocation[]) || [];
      setLocations(list);
    };
    fetchLocations();
  }, []);

  // Popular = top 6 highest-rated locations + compute review stats for cards
  useEffect(() => {
    const fetchPopular = async () => {
      if (locations.length === 0) return;
      const { data: revs } = await supabase.from("reviews").select("location_id, rating");
      const stats = new Map<string, { sum: number; count: number }>();
      (revs || []).forEach((r: any) => {
        const cur = stats.get(r.location_id) || { sum: 0, count: 0 };
        cur.sum += r.rating;
        cur.count += 1;
        stats.set(r.location_id, cur);
      });
      const statsObj: Record<string, { avg: number; count: number }> = {};
      stats.forEach((v, k) => { statsObj[k] = { avg: v.sum / v.count, count: v.count }; });
      setReviewStats(statsObj);

      const ranked = locations
        .map((l) => {
          const s = stats.get(l.id);
          return { loc: l, avg: s ? s.sum / s.count : 0, count: s?.count || 0 };
        })
        .sort((a, b) => (b.avg !== a.avg ? b.avg - a.avg : b.count - a.count))
        .slice(0, 6)
        .map((r) => r.loc);
      setPopular(ranked.length > 0 ? ranked : locations.slice(0, 6));
    };
    fetchPopular();
  }, [locations]);

  // Compute true availability per location for selected time window
  useEffect(() => {
    const compute = async () => {
      if (locations.length === 0) return;
      const map: Record<string, number> = {};
      // get all slots
      const { data: allSlots } = await supabase.from("parking_slots").select("id, location_id, is_available");
      const slotsByLoc: Record<string, { id: string; is_available: boolean }[]> = {};
      (allSlots || []).forEach((s) => {
        if (!slotsByLoc[s.location_id]) slotsByLoc[s.location_id] = [];
        slotsByLoc[s.location_id].push(s);
      });

      // for each location, get unavailable in the time range
      await Promise.all(locations.map(async (loc) => {
        const allOpen = (slotsByLoc[loc.id] || []).filter((s) => s.is_available);
        if (allOpen.length === 0) { map[loc.id] = 0; return; }
        const { data: unavail } = await supabase.rpc("get_unavailable_slots", {
          _location_id: loc.id,
          _start_time: startDate.toISOString(),
          _end_time: endDate.toISOString(),
        });
        const blocked = new Set((unavail || []).map((u: any) => u.slot_id));
        map[loc.id] = allOpen.filter((s) => !blocked.has(s.id)).length;
      }));
      setAvailableMap(map);
    };
    compute();
  }, [locations, startDate, endDate]);

  const enriched = useMemo(() => {
    return locations.map(loc => {
      let dist: number | null = null;
      if (position && loc.lat && loc.lng) {
        dist = haversineDistance(position.lat, position.lng, loc.lat, loc.lng);
      }
      return { ...loc, distance: dist, available_slots: availableMap[loc.id] ?? 0 };
    });
  }, [locations, position, availableMap]);

  const filtered = useMemo(() => {
    let result = enriched;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
      );
    }
    result = result.filter(l => l.price_per_hour <= maxPrice);
    if (position) result = result.filter(l => l.distance === null || l.distance <= maxDistance);
    if (onlyAvailable) result = result.filter(l => l.available_slots > 0);

    result = [...result].sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      if (a.distance !== null) return -1;
      return 0;
    });
    return result;
  }, [enriched, search, maxPrice, maxDistance, onlyAvailable, position]);

  const goToBooking = (locId: string, lotName?: string) => {
    const target = `/parking/${locId}?date=${date}&hour=${startHour}&duration=${duration}`;
    navigate(`/drive?lot=${encodeURIComponent(lotName || "your spot")}&to=${encodeURIComponent(target)}`);
  };

  const mapLocations = filtered.map(l => ({
    id: l.id, name: l.name, address: l.address, lat: l.lat, lng: l.lng, price_per_hour: l.price_per_hour,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Search + filters toggle */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by city, area, or landmark..."
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 h-[46px] w-[46px] rounded-xl"
            onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Date/time filter chip strip */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-3">Showing availability for:</p>
          <DateTimePicker
            date={date} startHour={startHour} duration={duration}
            onDateChange={setDate} onStartHourChange={setStartHour} onDurationChange={setDuration}
          />
        </div>

        {/* Popular locations - real data */}
        {!search && popular.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Popular locations:</p>
            <div className="flex flex-wrap gap-2">
              {popular.map(p => (
                <button
                  key={p.id}
                  onClick={() => goToBooking(p.id, p.name)}
                  className="px-3 py-1.5 text-xs rounded-full border border-border text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  🅿️ {p.name} — {p.city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-card border border-border rounded-xl p-5 mb-6 grid sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Price: ${maxPrice}/hr</label>
              <input type="range" min={1} max={100} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-primary" />
            </div>
            {position && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Distance: {maxDistance} km</label>
                <input type="range" min={1} max={100} value={maxDistance}
                  onChange={e => setMaxDistance(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="avail" checked={onlyAvailable}
                onChange={e => setOnlyAvailable(e.target.checked)} className="accent-primary" />
              <label htmlFor="avail" className="text-xs text-muted-foreground">Available spots only</label>
            </div>
          </motion.div>
        )}

        {position && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Navigation className="w-3 h-3 text-primary" />
            <span>Using your location · Showing nearest first</span>
          </div>
        )}

        <ParkingMap
          locations={mapLocations}
          selectedLocationId={selectedId}
          onLocationSelect={(loc) => setSelectedId(loc.id)}
          className="h-[350px] mb-8"
        />

        <h2 className="text-lg font-bold text-foreground mb-4">
          {search ? `Results for "${search}"` : "Nearby Parking"} ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No parking locations found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(loc => (
              <ParkingCard
                key={loc.id}
                id={loc.id}
                name={loc.name}
                address={loc.address}
                price_per_hour={loc.price_per_hour}
                image_url={loc.image_url}
                images={loc.images || undefined}
                distance={loc.distance !== null ? formatDistance(loc.distance) : undefined}
                available_slots={loc.available_slots}
                total_slots={loc.total_slots}
                avg_rating={reviewStats[loc.id]?.avg}
                review_count={reviewStats[loc.id]?.count}
                isSelected={selectedId === loc.id}
                onClick={() => goToBooking(loc.id, loc.name)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FindParking;
