import { Calendar, Clock } from "lucide-react";
import { HOURS, today, maxDate } from "@/lib/booking";

interface DateTimePickerProps {
  date: string;
  startHour: number;
  duration: number;
  onDateChange: (d: string) => void;
  onStartHourChange: (h: number) => void;
  onDurationChange: (d: number) => void;
  minHour?: number;
}

const DateTimePicker = ({
  date, startHour, duration, onDateChange, onStartHourChange, onDurationChange, minHour = 0,
}: DateTimePickerProps) => {
  const endHour = (startHour + duration) % 24;
  const fmt = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${period}`;
  };

  return (
    <div className="space-y-4">
      {/* Date */}
      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
          <Calendar className="w-3 h-3" /> Date
        </label>
        <input
          type="date"
          value={date}
          min={today()}
          max={maxDate()}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
        />
      </div>

      {/* Start hour */}
      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
          <Clock className="w-3 h-3" /> Start time
        </label>
        <select
          value={startHour}
          onChange={(e) => onStartHourChange(Number(e.target.value))}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
        >
          {HOURS.filter((h) => h >= minHour).map((h) => (
            <option key={h} value={h}>{fmt(h)}</option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Duration</label>
        <div className="flex items-center justify-between bg-background border border-border rounded-xl px-3 py-2">
          <button
            onClick={() => onDurationChange(Math.max(1, duration - 1))}
            className="w-8 h-8 rounded-lg border border-border text-foreground text-lg leading-none"
          >−</button>
          <div className="text-sm">
            <span className="font-medium text-foreground">{duration}h</span>
            <span className="text-muted-foreground ml-2">→ ends at {fmt(endHour)}</span>
          </div>
          <button
            onClick={() => onDurationChange(Math.min(12, duration + 1))}
            className="w-8 h-8 rounded-lg border border-border text-foreground text-lg leading-none"
          >+</button>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;
