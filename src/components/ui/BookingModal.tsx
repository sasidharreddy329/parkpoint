import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BookingModalProps {
  slotId: string;
  onClose: () => void;
  onBook: (slotId: string, duration: number) => void;
}

const durations = [
  { label: "30 min", value: 30, price: "$2.50" },
  { label: "1 hour", value: 60, price: "$4.00" },
  { label: "2 hours", value: 120, price: "$7.00" },
  { label: "4 hours", value: 240, price: "$12.00" },
];

const BookingModal = ({ slotId, onClose, onBook }: BookingModalProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    if (selected !== null) {
      onBook(slotId, selected);
      setBooked(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass-panel relative z-10 w-full max-w-md rounded-2xl p-8"
          onClick={(e) => e.stopPropagation()}
          style={{ boxShadow: "var(--shadow-cinematic)" }}
        >
          {booked ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-display font-semibold text-foreground mb-2">Booked!</h3>
              <p className="text-muted-foreground">Slot {slotId} is reserved for you.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
                  Park Point
                </p>
                <h3 className="text-3xl font-display font-bold text-foreground">
                  Slot {slotId}
                </h3>
                <p className="text-muted-foreground mt-1">Select parking duration</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setSelected(d.value)}
                    className={`rounded-xl p-4 text-left transition-all duration-200 border ${
                      selected === d.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/50 hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="text-lg font-semibold text-foreground">{d.label}</div>
                    <div className="text-sm text-muted-foreground">{d.price}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  disabled={selected === null}
                  className="flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-30 hover:opacity-90"
                >
                  Confirm Booking
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
