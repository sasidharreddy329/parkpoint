import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddressSearchProps {
  onSelect: (result: { lat: number; lng: number; label: string }) => void;
  placeholder?: string;
  className?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const AddressSearch = ({ onSelect, placeholder = "Search an address…", className }: AddressSearchProps) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
        { headers: { Accept: "application/json" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(true);
      if (data.length === 0) toast.error("No results found");
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const pick = (r: NominatimResult) => {
    onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name });
    setQ(r.display_name.split(",").slice(0, 2).join(","));
    setOpen(false);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
            placeholder={placeholder}
            className="w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-[1000] max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => pick(r)}
              className="w-full text-left px-3 py-2.5 text-xs hover:bg-muted border-b border-border last:border-0 text-foreground"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearch;
