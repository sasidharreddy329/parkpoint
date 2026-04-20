import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

const CarTransition = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lotName = searchParams.get("lot") || "Parking Garage";
  // Optional explicit destination after the animation completes
  const to = searchParams.get("to");
  const [phase, setPhase] = useState(0); // 0=enter, 1=drive, 2=gate, 3=park, 4=fade

  useEffect(() => {
    const timings = [800, 2200, 1200, 1000, 800];
    let timeout: number;
    const advance = (p: number) => {
      if (p < 4) {
        timeout = window.setTimeout(() => {
          setPhase(p + 1);
          advance(p + 1);
        }, timings[p]);
      } else {
        timeout = window.setTimeout(() => {
          if (to) {
            navigate(decodeURIComponent(to));
          } else {
            navigate(`/find-parking?lot=${encodeURIComponent(lotName)}`);
          }
        }, timings[4]);
      }
    };
    advance(0);
    return () => clearTimeout(timeout);
  }, [navigate, lotName, to]);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[hsl(220,20%,95%)] to-[hsl(220,14%,88%)] overflow-hidden">
      {/* Parallax City Background - far layer */}
      <motion.div
        className="absolute inset-0"
        animate={{ x: phase >= 1 ? -120 : 0 }}
        transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <svg className="absolute bottom-[30%] w-[150%] h-[40%] opacity-20" viewBox="0 0 1800 400" preserveAspectRatio="xMidYMax slice">
          <rect x="50" y="80" width="80" height="320" rx="3" fill="hsl(var(--foreground))" />
          <rect x="160" y="40" width="60" height="360" rx="3" fill="hsl(var(--foreground))" />
          <rect x="260" y="100" width="90" height="300" rx="3" fill="hsl(var(--foreground))" />
          <rect x="400" y="60" width="70" height="340" rx="3" fill="hsl(var(--foreground))" />
          <rect x="510" y="120" width="100" height="280" rx="3" fill="hsl(var(--foreground))" />
          <rect x="660" y="30" width="75" height="370" rx="3" fill="hsl(var(--foreground))" />
          <rect x="780" y="90" width="85" height="310" rx="3" fill="hsl(var(--foreground))" />
          <rect x="910" y="50" width="65" height="350" rx="3" fill="hsl(var(--foreground))" />
          <rect x="1020" y="110" width="95" height="290" rx="3" fill="hsl(var(--foreground))" />
          <rect x="1160" y="70" width="70" height="330" rx="3" fill="hsl(var(--foreground))" />
          <rect x="1280" y="40" width="80" height="360" rx="3" fill="hsl(var(--foreground))" />
          <rect x="1400" y="100" width="90" height="300" rx="3" fill="hsl(var(--foreground))" />
          <rect x="1540" y="60" width="75" height="340" rx="3" fill="hsl(var(--foreground))" />
          <rect x="1650" y="85" width="85" height="315" rx="3" fill="hsl(var(--foreground))" />
        </svg>
      </motion.div>

      {/* Parallax City - mid layer */}
      <motion.div
        className="absolute inset-0"
        animate={{ x: phase >= 1 ? -200 : 0 }}
        transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <svg className="absolute bottom-[30%] w-[140%] h-[45%] opacity-30" viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice">
          <rect x="80" y="100" width="70" height="300" rx="2" fill="hsl(var(--foreground))" />
          <rect x="200" y="60" width="55" height="340" rx="2" fill="hsl(var(--foreground))" />
          <rect x="310" y="130" width="85" height="270" rx="2" fill="hsl(var(--foreground))" />
          <rect x="450" y="40" width="60" height="360" rx="2" fill="hsl(var(--foreground))" />
          <rect x="560" y="90" width="75" height="310" rx="2" fill="hsl(var(--foreground))" />
          <rect x="700" y="70" width="65" height="330" rx="2" fill="hsl(var(--foreground))" />
          <rect x="820" y="110" width="80" height="290" rx="2" fill="hsl(var(--foreground))" />
          <rect x="960" y="50" width="70" height="350" rx="2" fill="hsl(var(--foreground))" />
          <rect x="1080" y="80" width="90" height="320" rx="2" fill="hsl(var(--foreground))" />
          <rect x="1220" y="100" width="75" height="300" rx="2" fill="hsl(var(--foreground))" />
          <rect x="1350" y="55" width="65" height="345" rx="2" fill="hsl(var(--foreground))" />
          <rect x="1460" y="90" width="80" height="310" rx="2" fill="hsl(var(--foreground))" />
        </svg>
      </motion.div>

      {/* Location Pins floating */}
      {[
        { x: "12%", y: "18%" },
        { x: "35%", y: "12%" },
        { x: "65%", y: "22%" },
        { x: "82%", y: "15%" },
        { x: "48%", y: "28%" },
      ].map((pin, i) => (
        <motion.div
          key={i}
          className="absolute z-10"
          style={{ left: pin.x, top: pin.y }}
          animate={{
            y: [0, -8, 0],
            x: phase >= 1 ? -150 * (i % 2 === 0 ? 1 : 0.6) : 0,
          }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, delay: i * 0.3 },
            x: { duration: 3, ease: [0.25, 0.1, 0.25, 1] },
          }}
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>
      ))}

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%]">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-t from-[hsl(220,10%,75%)] to-[hsl(220,10%,82%)]" />
        {/* Road surface */}
        <div className="absolute top-[35%] left-0 right-0 h-[30%] bg-[hsl(220,10%,40%)]" />
        {/* Road center line */}
        <motion.div
          className="absolute top-[48%] left-0 right-0 flex gap-6"
          animate={{ x: phase >= 1 ? -300 : 0 }}
          transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-10 h-[3px] bg-amber-300/70 shrink-0" />
          ))}
        </motion.div>
        {/* Sidewalk */}
        <div className="absolute top-[28%] left-0 right-0 h-[7%] bg-[hsl(220,10%,72%)]" />
        <div className="absolute top-[65%] left-0 right-0 h-[7%] bg-[hsl(220,10%,72%)]" />
      </div>

      {/* Parking Garage - moves into view */}
      <motion.div
        className="absolute bottom-[17%] z-20"
        animate={{
          right: phase >= 2 ? "20%" : "-30%",
        }}
        transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="relative w-[350px] h-[220px]">
          {/* Main structure */}
          <div className="absolute inset-0 bg-[hsl(220,14%,92%)] border-2 border-[hsl(220,13%,80%)] rounded-t-lg shadow-2xl">
            {/* Roof */}
            <div className="absolute -top-4 -left-2 -right-2 h-8 bg-[hsl(220,14%,88%)] border-2 border-[hsl(220,13%,80%)] rounded-t-lg" />
            {/* ParkPoint Sign */}
            <motion.div
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-5 py-1.5 rounded-lg shadow-lg shadow-primary/20"
              animate={{ scale: phase >= 2 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              🅿️ {lotName}
            </motion.div>
            {/* Entrance */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90px] h-[110px] bg-[hsl(220,10%,30%)] rounded-t-lg overflow-hidden">
              {/* Gate barrier */}
              <motion.div
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary/40 to-primary/20"
                animate={{
                  height: phase >= 3 ? "0%" : "100%",
                }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              />
              {/* Barrier arm */}
              <motion.div
                className="absolute left-0 right-0 h-[6px] bg-amber-400 shadow-lg"
                animate={{
                  top: phase >= 3 ? "-10%" : "85%",
                  rotate: phase >= 3 ? -90 : 0,
                  transformOrigin: "right",
                }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              />
              {/* Interior glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-100/20 to-transparent" />
            </div>
            {/* Windows grid */}
            <div className="grid grid-cols-5 gap-2 p-4 pt-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-7 rounded-sm border"
                  animate={{
                    backgroundColor: phase >= 2
                      ? i % 3 === 0
                        ? "hsl(45, 80%, 85%)"
                        : "hsl(210, 30%, 96%)"
                      : "hsl(210, 30%, 96%)",
                    borderColor: "hsl(220, 13%, 80%)",
                  }}
                  transition={{ delay: i * 0.05 + 0.5 }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* THE CAR */}
      <motion.div
        className="absolute z-30"
        style={{ bottom: "22%" }}
        animate={{
          left:
            phase === 0
              ? "-15%"
              : phase === 1
              ? "35%"
              : phase <= 3
              ? "42%"
              : "52%",
        }}
        transition={{
          duration: phase === 0 ? 0 : phase === 1 ? 2.5 : phase === 4 ? 1 : 1.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <svg width="130" height="58" viewBox="0 0 130 58" className="drop-shadow-2xl">
          <defs>
            {/* Headlight glow */}
            <radialGradient id="headlightGlow" cx="100%" cy="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFD700" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="tailglow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Headlight beam */}
          <ellipse cx="128" cy="33" rx="25" ry="12" fill="url(#headlightGlow)" opacity="0.6" />
          {/* Car shadow */}
          <ellipse cx="65" cy="55" rx="50" ry="4" fill="hsl(var(--foreground))" opacity="0.15" />
          {/* Car body */}
          <rect x="8" y="24" width="112" height="22" rx="6" fill="hsl(var(--foreground))" opacity="0.9" />
          {/* Hood slope */}
          <path d="M100 24 Q108 24 115 28 L115 34 Q108 24 100 24" fill="hsl(var(--foreground))" opacity="0.85" />
          {/* Cabin */}
          <path d="M30 24 Q36 8 52 8 L78 8 Q92 8 96 24" fill="hsl(var(--foreground))" opacity="0.75" />
          {/* Windows */}
          <path d="M36 23 Q40 12 52 12 L62 12 L62 23 Z" fill="hsl(var(--primary))" opacity="0.45" />
          <path d="M65 23 L65 12 L78 12 Q88 12 91 23 Z" fill="hsl(var(--primary))" opacity="0.45" />
          {/* Chrome trim */}
          <rect x="30" y="23" width="66" height="1.5" rx="0.5" fill="hsl(var(--foreground))" opacity="0.3" />
          {/* Headlights */}
          <rect x="116" y="28" width="8" height="5" rx="2" fill="#FFD700" filter="url(#glow)">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <rect x="116" y="35" width="8" height="5" rx="2" fill="#FFD700" filter="url(#glow)">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
          </rect>
          {/* Taillights */}
          <rect x="4" y="28" width="7" height="5" rx="2" fill="#FF2222" filter="url(#tailglow)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
          </rect>
          <rect x="4" y="35" width="7" height="5" rx="2" fill="#FF2222" filter="url(#tailglow)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
          </rect>
          {/* Wheels */}
          <circle cx="32" cy="48" r="8" fill="hsl(var(--foreground))" />
          <circle cx="32" cy="48" r="4" fill="hsl(var(--muted))" />
          <circle cx="32" cy="48" r="1.5" fill="hsl(var(--foreground))" opacity="0.5" />
          <circle cx="96" cy="48" r="8" fill="hsl(var(--foreground))" />
          <circle cx="96" cy="48" r="4" fill="hsl(var(--muted))" />
          <circle cx="96" cy="48" r="1.5" fill="hsl(var(--foreground))" opacity="0.5" />
          {/* Wheel spin animation */}
          {phase >= 1 && phase <= 3 && (
            <>
              <circle cx="32" cy="48" r="6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="2 2">
                <animateTransform attributeName="transform" type="rotate" from="0 32 48" to="360 32 48" dur="0.3s" repeatCount="indefinite" />
              </circle>
              <circle cx="96" cy="48" r="6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="2 2">
                <animateTransform attributeName="transform" type="rotate" from="0 96 48" to="360 96 48" dur="0.3s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
      </motion.div>

      {/* Status text overlays */}
      <AnimatePresence mode="wait">
        {phase <= 1 && (
          <motion.div
            key="step1"
            className="absolute top-[10%] left-1/2 -translate-x-1/2 text-center z-40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl px-8 py-6 shadow-2xl">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">NAVIGATING</span>
              <h2 className="text-2xl font-bold text-foreground mt-3">Driving to {lotName}</h2>
              <p className="text-sm text-muted-foreground mt-2">Finding the best route to your parking spot...</p>
            </div>
          </motion.div>
        )}
        {phase === 2 && (
          <motion.div
            key="step2"
            className="absolute top-[10%] left-[8%] z-40"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl px-6 py-5 shadow-2xl max-w-xs">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">ARRIVING</span>
              <h3 className="text-xl font-bold text-foreground mt-3">Gate opening...</h3>
              <p className="text-sm text-muted-foreground mt-2">Welcome to {lotName}. The barrier will lift automatically.</p>
            </div>
          </motion.div>
        )}
        {phase >= 3 && phase < 4 && (
          <motion.div
            key="step3"
            className="absolute top-[10%] left-1/2 -translate-x-1/2 z-40"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl px-8 py-6 shadow-2xl text-center">
              <span className="text-xs font-semibold text-parking-available bg-parking-available/10 px-3 py-1 rounded-full">ARRIVED</span>
              <h3 className="text-xl font-bold text-foreground mt-3">You're here!</h3>
              <p className="text-sm text-muted-foreground mt-2">Loading available parking slots...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen fade out */}
      <motion.div
        className="absolute inset-0 z-50 bg-background pointer-events-none"
        animate={{ opacity: phase >= 4 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Progress bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
        {[0, 1, 2, 3].map((p) => (
          <motion.div
            key={p}
            className="h-1.5 rounded-full"
            animate={{
              width: phase >= p ? 32 : 12,
              backgroundColor: phase >= p ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CarTransition;
