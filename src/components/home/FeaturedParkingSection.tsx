import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Reveal from "@/components/Reveal";

const lots = [
  {
    id: "central-plaza",
    name: "Central Plaza",
    location: "Downtown, NY",
    price: "$5/hr",
    tags: ["CCTV", "Covered", "EV"],
    color: "bg-slate-800",
  },
  {
    id: "westside-station",
    name: "Westside Station",
    location: "West End, NY",
    price: "$3/hr",
    tags: ["24/7", "Guarded"],
    color: "bg-slate-700",
  },
  {
    id: "market-street",
    name: "Market Street",
    location: "Downtown, NY",
    price: "$4/hr",
    tags: ["Valet", "Car Wash"],
    color: "bg-slate-600",
  },
  {
    id: "airport-long-term",
    name: "Airport Long Term",
    location: "JFK Airport",
    price: "$12/day",
    tags: ["Shuttle", "Secure"],
    color: "bg-slate-500",
  },
];

const FeaturedParkingSection = () => {
  const navigate = useNavigate();

  const handleSelectLot = (lot: typeof lots[0]) => {
    navigate(`/drive?lot=${encodeURIComponent(lot.name)}`);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Reveal direction="up" className="text-center mb-14">
        <p className="section-label">FEATURED</p>
        <h2 className="section-title">Popular Parking Locations</h2>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {lots.map((lot, i) => (
          <Reveal key={lot.id} direction="up" delay={i * 100}>
          <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
            <div className={`${lot.color} h-36 flex items-center justify-center`}>
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground">{lot.name}</h3>
                <span className="text-primary text-sm font-semibold">{lot.price}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="w-3 h-3" />
                {lot.location}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {lot.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <Button
                className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleSelectLot(lot)}
              >
                Book Now
              </Button>
            </div>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default FeaturedParkingSection;
