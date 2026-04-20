import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { today, maxDate, HOURS } from "@/lib/booking";

const HeroSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  // Subtle parallax: background drifts down slower than scroll, content drifts up faster
  const bgY = useTransform(scrollY, [0, 800], ["0%", "30%"]);
  const bgScale = useTransform(scrollY, [0, 800], [1.05, 1.18]);
  const overlayOpacity = useTransform(scrollY, [0, 600], [1, 1.25]);
  const contentY = useTransform(scrollY, [0, 600], ["0px", "-80px"]);
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(today());
  const [hour, setHour] = useState((new Date().getHours() + 1) % 24);
  const [duration, setDuration] = useState(2);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const fmtHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${period}`;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("q", location);
    params.set("date", date);
    params.set("hour", String(hour));
    params.set("duration", String(duration));
    const target = `/find-parking?${params.toString()}`;
    // Trigger the car animation, then land on results
    navigate(`/drive?lot=${encodeURIComponent(location || "your destination")}&to=${encodeURIComponent(target)}`);
  };

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden">
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 will-change-transform"
      >
        <video autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={() => setLoaded(true)}>
          <source src="/parking.mp4" type="video/mp4" />
        </video>
      </motion.div>

      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        initial={{ opacity: 0, y: 30 }} animate={loaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium px-5 py-2 rounded-full mb-8 border border-white/20"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Smart Parking Solution v2.0 Live
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-white max-w-4xl tracking-tight">
          Find & Book{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Parking Slots
          </span>{" "}
          Instantly
        </h1>

        <motion.p initial={{ opacity: 0 }} animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-6 text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl"
        >
          Save time and money by booking your parking spot in advance. Real-time availability across thousands of locations.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] items-stretch gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl w-full max-w-3xl"
        >
          <div className="flex items-center gap-2 px-3 min-w-0">
            <MapPin className="w-4 h-4 text-white/50 shrink-0" />
            <input type="text" placeholder="Where are you going?"
              value={location} onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-transparent text-sm outline-none w-full py-2.5 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2 sm:border-l border-white/20">
            <Calendar className="w-4 h-4 text-white/50 shrink-0" />
            <input type="date" value={date} min={today()} max={maxDate()}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs outline-none text-white w-full [color-scheme:dark]"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2 sm:border-l border-white/20">
            <Clock className="w-4 h-4 text-white/50 shrink-0" />
            <select value={hour} onChange={(e) => setHour(Number(e.target.value))}
              className="bg-transparent text-xs outline-none text-white w-full">
              {HOURS.map(h => <option key={h} value={h} className="bg-background text-foreground">{fmtHour(h)}</option>)}
            </select>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-transparent text-xs outline-none text-white">
              {[1,2,3,4,6,8,12].map(d => <option key={d} value={d} className="bg-background text-foreground">{d}h</option>)}
            </select>
          </div>
          <Button onClick={handleSearch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 gap-2 shadow-lg shadow-primary/30">
            Search <Search className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 flex items-center gap-3"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-xs font-medium text-white">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center text-xs font-medium text-primary-foreground">+2k</div>
          </div>
          <span className="text-sm text-white/60"><strong className="text-white">4.9/5</strong> rating from happy drivers</span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
