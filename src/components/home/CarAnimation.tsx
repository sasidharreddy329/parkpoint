import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CarAnimation = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Car moves from left to right across the scene
  const carX = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], ["-100%", "10%", "45%", "45%"]);
  // Gate lifts up
  const gateY = useTransform(scrollYProgress, [0.4, 0.55], ["0%", "-100%"]);
  // Car enters garage after gate
  const carX2 = useTransform(scrollYProgress, [0.6, 0.9], ["45%", "75%"]);
  const carOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);
  // Text reveals
  const textOpacity1 = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const textOpacity2 = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);
  const textOpacity3 = useTransform(scrollYProgress, [0.65, 0.75], [0, 1]);

  return (
    <section ref={sectionRef} className="relative h-[200vh]" id="car-experience">
      <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-muted/30 to-background">
        {/* City Skyline Background */}
        <div className="absolute inset-0">
          {/* Buildings */}
          <svg className="absolute bottom-0 w-full h-[60%] text-muted/50" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice">
            {/* Back row of buildings */}
            <rect x="50" y="100" width="60" height="300" rx="2" fill="hsl(var(--border))" opacity="0.4" />
            <rect x="130" y="60" width="45" height="340" rx="2" fill="hsl(var(--border))" opacity="0.3" />
            <rect x="200" y="120" width="70" height="280" rx="2" fill="hsl(var(--border))" opacity="0.35" />
            <rect x="300" y="80" width="50" height="320" rx="2" fill="hsl(var(--border))" opacity="0.3" />
            <rect x="380" y="140" width="80" height="260" rx="2" fill="hsl(var(--border))" opacity="0.4" />
            <rect x="500" y="50" width="55" height="350" rx="2" fill="hsl(var(--border))" opacity="0.3" />
            <rect x="580" y="100" width="65" height="300" rx="2" fill="hsl(var(--border))" opacity="0.35" />
            <rect x="680" y="70" width="50" height="330" rx="2" fill="hsl(var(--border))" opacity="0.3" />
            <rect x="760" y="130" width="75" height="270" rx="2" fill="hsl(var(--border))" opacity="0.4" />
            <rect x="870" y="90" width="55" height="310" rx="2" fill="hsl(var(--border))" opacity="0.3" />
            <rect x="950" y="110" width="60" height="290" rx="2" fill="hsl(var(--border))" opacity="0.35" />
            <rect x="1040" y="60" width="70" height="340" rx="2" fill="hsl(var(--border))" opacity="0.3" />
            <rect x="1130" y="100" width="50" height="300" rx="2" fill="hsl(var(--border))" opacity="0.4" />
          </svg>

          {/* Location Pins */}
          {[
            { x: "15%", y: "30%" },
            { x: "80%", y: "25%" },
            { x: "25%", y: "55%" },
            { x: "70%", y: "50%" },
            { x: "50%", y: "20%" },
          ].map((pin, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: pin.x, top: pin.y }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            >
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-3.5 h-3.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <div className="absolute bottom-16 left-0 right-0 h-20 bg-foreground/10" />
          {/* Road markings */}
          <div className="absolute bottom-[6.3rem] left-0 right-0 flex gap-8 px-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-12 h-1 bg-foreground/20 shrink-0" />
            ))}
          </div>
        </div>

        {/* Parking Garage */}
        <div className="absolute right-[10%] bottom-16 w-[300px] h-[200px]">
          {/* Structure */}
          <div className="absolute inset-0 bg-muted border-2 border-border rounded-t-lg">
            {/* Roof */}
            <div className="absolute -top-3 left-0 right-0 h-6 bg-muted border-2 border-border rounded-t-lg" />
            {/* Sign */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-md whitespace-nowrap">
              ParkPoint
            </div>
            {/* Entrance */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80px] h-[100px] bg-foreground/10 rounded-t-lg overflow-hidden">
              {/* Gate */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-full bg-primary/30 border-b-4 border-primary"
                style={{ y: gateY }}
              />
              {/* Barrier stripes */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-400" />
            </div>
            {/* Windows */}
            <div className="grid grid-cols-4 gap-2 p-4 pt-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 bg-background/60 rounded-sm border border-border" />
              ))}
            </div>
          </div>
        </div>

        {/* Animated Car */}
        <motion.div
          className="absolute bottom-[5.5rem]"
          style={{ left: carX, opacity: carOpacity }}
        >
          <motion.div style={{ x: carX2 !== carX ? undefined : undefined }}>
            <svg width="100" height="45" viewBox="0 0 100 45" className="drop-shadow-xl">
              {/* Car body */}
              <rect x="5" y="18" width="90" height="18" rx="5" fill="hsl(var(--foreground))" opacity="0.85" />
              {/* Cabin */}
              <path d="M25 18 Q30 5 45 5 L65 5 Q75 5 78 18" fill="hsl(var(--foreground))" opacity="0.7" />
              {/* Windows */}
              <path d="M30 17 Q33 8 45 8 L52 8 L52 17 Z" fill="hsl(var(--primary))" opacity="0.5" />
              <path d="M54 17 L54 8 L65 8 Q73 8 75 17 Z" fill="hsl(var(--primary))" opacity="0.5" />
              {/* Headlights */}
              <rect x="90" y="22" width="6" height="4" rx="1" fill="#FFD700" opacity="0.9" />
              <rect x="90" y="28" width="6" height="4" rx="1" fill="#FFD700" opacity="0.9" />
              {/* Taillights */}
              <rect x="2" y="22" width="5" height="4" rx="1" fill="#FF3333" opacity="0.8" />
              <rect x="2" y="28" width="5" height="4" rx="1" fill="#FF3333" opacity="0.8" />
              {/* Wheels */}
              <circle cx="25" cy="38" r="7" fill="hsl(var(--foreground))" />
              <circle cx="25" cy="38" r="3" fill="hsl(var(--muted))" />
              <circle cx="75" cy="38" r="7" fill="hsl(var(--foreground))" />
              <circle cx="75" cy="38" r="3" fill="hsl(var(--muted))" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Text Overlays */}
        <motion.div
          className="absolute top-[15%] left-[5%] md:left-[10%] max-w-sm bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl"
          style={{ opacity: textOpacity1 }}
        >
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">STEP 1</span>
          <h3 className="text-xl font-bold text-foreground mt-3">Find your spot</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Search nearby parking locations with real-time availability and drive-in pricing.
          </p>
        </motion.div>

        <motion.div
          className="absolute top-[12%] right-[5%] md:right-[10%] max-w-sm bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl"
          style={{ opacity: textOpacity2 }}
        >
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">STEP 2</span>
          <h3 className="text-xl font-bold text-foreground mt-3">Drive in seamlessly</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            The gate opens automatically. No tickets, no hassle. Just drive in and park.
          </p>
        </motion.div>

        <motion.div
          className="absolute top-[15%] left-[5%] md:left-[10%] max-w-sm bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl"
          style={{ opacity: textOpacity3 }}
        >
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">STEP 3</span>
          <h3 className="text-xl font-bold text-foreground mt-3">Pay & go</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Pay seamlessly through the app when you leave. No fumbling for cash or tickets.
          </p>
        </motion.div>

        {/* Progress Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {[0.15, 0.45, 0.75].map((threshold, i) => (
            <ProgressDot key={i} scrollYProgress={scrollYProgress} threshold={threshold} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProgressDot = ({
  scrollYProgress,
  threshold,
}: {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  threshold: number;
}) => {
  const opacity = useTransform(
    scrollYProgress,
    [threshold - 0.05, threshold],
    [0.3, 1]
  );
  const scale = useTransform(
    scrollYProgress,
    [threshold - 0.05, threshold],
    [1, 1.5]
  );

  return (
    <motion.div
      className="w-2.5 h-2.5 rounded-full bg-primary"
      style={{ opacity, scale }}
    />
  );
};

export default CarAnimation;
