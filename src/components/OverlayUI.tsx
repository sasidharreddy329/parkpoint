import { motion, AnimatePresence } from "framer-motion";

interface OverlayUIProps {
  scrollProgress: number;
  selectedSlot: string | null;
}

const OverlayUI = ({ scrollProgress, selectedSlot }: OverlayUIProps) => {
  const showHero = scrollProgress < 0.12;
  const showTagline = scrollProgress > 0.2 && scrollProgress < 0.45;
  const showReveal = scrollProgress > 0.5 && scrollProgress < 0.72;
  const showInteraction = scrollProgress > 0.78;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <span className="font-display font-semibold text-foreground text-lg tracking-tight">
            Park Point
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {showHero && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-[0.3em]">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </motion.div>
      )}

      {/* Hero text */}
      <AnimatePresence>
        {showHero && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <h1 className="text-6xl md:text-8xl font-display font-bold text-gradient leading-tight">
              Find Parking
              <br />
              Instantly
            </h1>
            <p className="text-muted-foreground text-lg mt-6 max-w-md mx-auto">
              AI-powered smart parking at your fingertips
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tagline during car movement */}
      <AnimatePresence>
        {showTagline && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-1/2 right-12 -translate-y-1/2 text-right max-w-sm"
          >
            <p className="text-sm text-primary uppercase tracking-[0.3em] mb-3">Seamless</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
              Drive In.
              <br />
              Park Easy.
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parking reveal text */}
      <AnimatePresence>
        {showReveal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-sm text-primary uppercase tracking-[0.3em] mb-2">Real-time</p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground">
              Live Parking Overview
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction mode */}
      <AnimatePresence>
        {showInteraction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Select Your Slot
            </h2>
            <p className="text-muted-foreground text-sm">
              Click on a green slot to book it
            </p>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-parking-available" />
                <span className="text-xs text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-parking-occupied" />
                <span className="text-xs text-muted-foreground">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-parking-selected" />
                <span className="text-xs text-muted-foreground">Selected</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-muted">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  );
};

export default OverlayUI;
