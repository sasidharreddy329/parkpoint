import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Car, CreditCard, XCircle, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { directionsUrl } from "@/lib/booking";

interface Booking {
  id: string;
  slot_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  vehicle_number: string | null;
  parking_locations: { name: string; address: string; lat: number | null; lng: number | null } | null;
  parking_slots: { slot_label: string } | null;
}

const Dashboard = () => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, parking_locations(name, address, lat, lng), parking_slots(slot_label)")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });
      setBookings((data as unknown as Booking[]) || []);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const cancelBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled");
    } else {
      toast.error(error.message);
    }
  };

  const now = new Date();
  // auto-classify: active = status active AND end_time in future
  const enriched = bookings.map(b => {
    const ended = new Date(b.end_time) < now;
    const effectiveStatus = b.status === "active" && ended ? "completed" : b.status;
    return { ...b, effectiveStatus, ended };
  });

  const upcoming = enriched.filter(b => b.effectiveStatus === "active");
  const past = enriched.filter(b => b.effectiveStatus !== "active");
  const totalSpent = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + Number(b.total_price), 0);

  const fmtTime = (start: string, end: string) => {
    const s = new Date(start), e = new Date(end);
    return `${s.toLocaleDateString([], { month: "short", day: "numeric" })} · ${s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} → ${e.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage your bookings</p>
          </div>
          {role === "owner" && (
            <Link to="/owner"><Button variant="outline" size="sm">Owner Dashboard →</Button></Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <CalendarCheck className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Active / Upcoming</p>
            <p className="text-2xl font-bold text-foreground">{upcoming.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <Car className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <CreditCard className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-foreground mb-4">Active & Upcoming</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : upcoming.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center mb-8">
            <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No active bookings</p>
            <Link to="/find-parking"><Button size="sm" className="mt-4">Find Parking</Button></Link>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {upcoming.map(b => (
              <div key={b.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-semibold text-foreground">{b.parking_locations?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.parking_locations?.address}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" />
                      <span>Slot {b.parking_slots?.slot_label} · {fmtTime(b.start_time, b.end_time)}</span>
                    </div>
                    {b.vehicle_number && (
                      <p className="text-xs text-muted-foreground mt-1">Vehicle: {b.vehicle_number}</p>
                    )}
                    <p className="text-sm font-medium text-primary mt-2">${Number(b.total_price).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {b.parking_locations?.lat && b.parking_locations?.lng && (
                      <a href={directionsUrl(b.parking_locations.lat, b.parking_locations.lng)}
                        target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Navigation className="w-3.5 h-3.5" /> Directions
                        </Button>
                      </a>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => cancelBooking(b.id)}>
                      <XCircle className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-foreground mb-4">Booking History</h2>
            <div className="space-y-3">
              {past.map(b => (
                <div key={b.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between opacity-80">
                  <div>
                    <p className="font-semibold text-foreground">{b.parking_locations?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      Slot {b.parking_slots?.slot_label} · {fmtTime(b.start_time, b.end_time)}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    b.effectiveStatus === "cancelled" ? "bg-destructive/15 text-destructive" :
                    b.effectiveStatus === "completed" ? "bg-muted text-muted-foreground" :
                    "bg-primary/10 text-primary"
                  }`}>{b.effectiveStatus}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
