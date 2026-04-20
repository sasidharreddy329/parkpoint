import { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, DollarSign, LayoutGrid, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LocationPickerMap from "@/components/map/LocationPickerMap";
import ImageUpload from "@/components/parking/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Location {
  id: string; name: string; address: string; city: string;
  price_per_hour: number; total_slots: number; is_active: boolean;
  lat: number | null; lng: number | null; images: string[] | null;
}

interface Slot { id: string; slot_label: string; is_available: boolean; location_id: string; }

interface Booking {
  id: string; start_time: string; end_time: string;
  total_price: number; status: string; vehicle_number: string | null;
  parking_slots: { slot_label: string } | null;
}

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tab, setTab] = useState<"slots" | "bookings">("bookings");

  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPrice, setNewPrice] = useState("5.00");
  const [newSlotCount, setNewSlotCount] = useState("10");
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchLocations();
  }, [user]);

  const fetchLocations = async () => {
    const { data } = await supabase.from("parking_locations").select("*").eq("owner_id", user!.id);
    setLocations((data as Location[]) || []);
    if (data && data.length > 0 && !selectedLocation) setSelectedLocation(data[0] as Location);
  };

  useEffect(() => {
    if (!selectedLocation) return;
    const fetchSlots = async () => {
      const { data } = await supabase.from("parking_slots").select("*").eq("location_id", selectedLocation.id);
      setSlots(data || []);
    };
    fetchBookings();
    fetchSlots();
  }, [selectedLocation]);

  const fetchBookings = async () => {
    if (!selectedLocation) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, parking_slots(slot_label)")
      .eq("location_id", selectedLocation.id)
      .order("start_time", { ascending: false });
    setBookings((data as unknown as Booking[]) || []);
  };

  const addLocation = async () => {
    if (!newName || !newAddress || !newCity) { toast.error("Please fill all required fields"); return; }
    if (!newCoords) { toast.error("Please pick a location on the map"); return; }
    if (newImages.length < 2) { toast.error("Please upload at least 2 images"); return; }

    const slotCount = parseInt(newSlotCount);
    const { data, error } = await supabase
      .from("parking_locations")
      .insert({
        owner_id: user!.id,
        name: newName, address: newAddress, city: newCity,
        price_per_hour: parseFloat(newPrice),
        total_slots: slotCount,
        lat: newCoords.lat, lng: newCoords.lng,
        images: newImages,
      })
      .select().single();

    if (error) { toast.error(error.message); return; }

    const slotsToInsert = Array.from({ length: slotCount }, (_, i) => ({
      location_id: data.id,
      slot_label: `${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`,
      slot_type: "standard",
    }));
    await supabase.from("parking_slots").insert(slotsToInsert);

    toast.success(`Location added with ${slotCount} slots!`);
    setShowAddForm(false);
    setNewName(""); setNewAddress(""); setNewCity(""); setNewPrice("5.00"); setNewSlotCount("10");
    setNewCoords(null); setNewImages([]);
    fetchLocations();
  };

  const toggleSlotAvailability = async (slotId: string, currentState: boolean) => {
    await supabase.from("parking_slots").update({ is_available: !currentState }).eq("id", slotId);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, is_available: !currentState } : s));
  };

  const completeBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "completed" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking marked complete");
    fetchBookings();
  };

  const deleteLocation = async (id: string) => {
    await supabase.from("parking_locations").delete().eq("id", id);
    setLocations(prev => prev.filter(l => l.id !== id));
    if (selectedLocation?.id === id) setSelectedLocation(null);
    toast.success("Location deleted");
  };

  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + Number(b.total_price), 0);
  const inputClass = "bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground";

  const now = new Date();
  const isPast = (b: Booking) => new Date(b.end_time) < now;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage your parking locations</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Location
          </Button>
        </div>

        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-foreground mb-4">Add New Parking Location</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Location Name *" className={inputClass} />
              <input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Address *" className={inputClass} />
              <input value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="City *" className={inputClass} />
              <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Price/hr" className={inputClass} />
              <input type="number" value={newSlotCount} onChange={e => setNewSlotCount(e.target.value)} placeholder="Number of Slots" className={inputClass} />
            </div>

            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block">
                📍 Search address or click the map {newCoords && <span className="text-primary font-medium">({newCoords.lat.toFixed(4)}, {newCoords.lng.toFixed(4)})</span>}
              </label>
              <LocationPickerMap
                value={newCoords}
                onChange={setNewCoords}
                onAddressFound={(addr) => {
                  if (!newAddress) setNewAddress(addr.split(",").slice(0, 2).join(","));
                }}
                className="h-[300px]"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block">📸 Upload Images (min 2 — required)</label>
              <ImageUpload images={newImages} onChange={setNewImages} />
            </div>

            <div className="flex gap-3">
              <Button onClick={addLocation}>Create Location</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <MapPin className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Locations</p>
            <p className="text-2xl font-bold text-foreground">{locations.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <LayoutGrid className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Total Slots</p>
            <p className="text-2xl font-bold text-foreground">{locations.reduce((s, l) => s + l.total_slots, 0)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <DollarSign className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-2">
            <h3 className="font-bold text-foreground text-sm mb-3">Your Locations</h3>
            {locations.map(loc => (
              <button key={loc.id} onClick={() => setSelectedLocation(loc)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedLocation?.id === loc.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}>
                <p className="font-medium text-foreground text-sm">{loc.name}</p>
                <p className="text-xs text-muted-foreground">{loc.city} · ${loc.price_per_hour}/hr</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {selectedLocation ? (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedLocation.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedLocation.address}, {selectedLocation.city}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteLocation(selectedLocation.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>

                {selectedLocation.images && selectedLocation.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
                    {selectedLocation.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0 border border-border" />
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mb-6">
                  <button onClick={() => setTab("bookings")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "bookings" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    Bookings ({bookings.length})
                  </button>
                  <button onClick={() => setTab("slots")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "slots" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    Slots ({slots.length})
                  </button>
                </div>

                {tab === "slots" ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {slots.map(slot => (
                      <button key={slot.id} onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                        className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-sm font-medium transition-all ${
                          slot.is_available
                            ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                        {slot.slot_label}
                        <span className="text-[10px] mt-1">{slot.is_available ? "Open" : "Closed"}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {bookings.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">No bookings yet</p>
                    ) : (
                      bookings.map(b => {
                        const past = isPast(b);
                        return (
                          <div key={b.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-xl">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">Slot {b.parking_slots?.slot_label}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(b.start_time).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                {" → "}
                                {new Date(b.end_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                              </p>
                              {b.vehicle_number && <p className="text-xs text-muted-foreground">🚗 {b.vehicle_number}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <p className="text-sm font-bold text-foreground">${Number(b.total_price).toFixed(2)}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  b.status === "active" ? (past ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400") :
                                  b.status === "cancelled" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {b.status === "active" && past ? "ended" : b.status}
                                </span>
                              </div>
                              {b.status === "active" && (
                                <Button variant="outline" size="sm" onClick={() => completeBooking(b.id)} title="Mark complete">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <Eye className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a location to manage</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;
