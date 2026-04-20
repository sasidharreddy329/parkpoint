// Helpers for date/time-based booking

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const formatDateInput = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const today = () => formatDateInput(new Date());

export const maxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return formatDateInput(d);
};

export const buildDateTime = (dateStr: string, hour: number) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(hour, 0, 0, 0);
  return d;
};

export const formatTimeRange = (start: Date, end: Date) => {
  const sameDay = start.toDateString() === end.toDateString();
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  if (sameDay) {
    return `${start.toLocaleDateString([], { month: "short", day: "numeric" })} · ${start.toLocaleTimeString([], opts)} – ${end.toLocaleTimeString([], opts)}`;
  }
  return `${start.toLocaleString([], { month: "short", day: "numeric", ...opts })} → ${end.toLocaleString([], { month: "short", day: "numeric", ...opts })}`;
};

export const directionsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
