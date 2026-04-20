import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface RouteMapProps {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  className?: string;
}

function FitToRoute({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
}

const RouteMap = ({ start, end, className }: RouteMapProps) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [info, setInfo] = useState<{ km: number; mins: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setRoute(coords);
          setInfo({ km: data.routes[0].distance / 1000, mins: data.routes[0].duration / 60 });
        }
      } catch {
        // fallback: straight line
        setRoute([[start.lat, start.lng], [end.lat, end.lng]]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [start.lat, start.lng, end.lat, end.lng]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className || ""}`}>
      <MapContainer center={[start.lat, start.lng]} zoom={13} className="w-full h-full z-0" style={{ minHeight: "300px" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[start.lat, start.lng]} icon={startIcon} />
        <Marker position={[end.lat, end.lng]} icon={endIcon} />
        {route.length > 0 && <Polyline positions={route} pathOptions={{ color: "hsl(var(--primary))", weight: 5, opacity: 0.85 }} />}
        <FitToRoute coords={route.length > 0 ? route : [[start.lat, start.lng], [end.lat, end.lng]]} />
      </MapContainer>

      {info && !loading && (
        <div className="absolute top-3 left-3 z-[1000] bg-card/95 backdrop-blur border border-border rounded-xl px-4 py-2 text-sm shadow-lg">
          <span className="font-bold text-foreground">{info.km.toFixed(1)} km</span>
          <span className="text-muted-foreground"> · ~{Math.round(info.mins)} min</span>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 z-[999] bg-background/40 flex items-center justify-center text-sm text-muted-foreground">
          Calculating route…
        </div>
      )}
    </div>
  );
};

export default RouteMap;
