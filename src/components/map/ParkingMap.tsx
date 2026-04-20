import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  price_per_hour: number;
}

interface ParkingMapProps {
  locations: Location[];
  selectedLocationId?: string | null;
  onLocationSelect?: (location: Location) => void;
  className?: string;
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    const valid = locations.filter((l) => l.lat && l.lng);
    if (valid.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(valid.map((l) => [l.lat!, l.lng!]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      fitted.current = true;
    }
  }, [locations, map]);

  return null;
}

function FlyToSelected({ location }: { location: Location | null }) {
  const map = useMap();
  useEffect(() => {
    if (location?.lat && location?.lng) {
      map.flyTo([location.lat, location.lng], 15, { duration: 1.2 });
    }
  }, [location, map]);
  return null;
}

const ParkingMap = ({ locations, selectedLocationId, onLocationSelect, className }: ParkingMapProps) => {
  const validLocations = locations.filter((l) => l.lat !== null && l.lng !== null);
  const selectedLoc = validLocations.find((l) => l.id === selectedLocationId) || null;

  const center: [number, number] = validLocations.length > 0
    ? [validLocations[0].lat!, validLocations[0].lng!]
    : [20.5937, 78.9629]; // Default India center

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className || ""}`}>
      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full z-0"
        style={{ minHeight: "300px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds locations={validLocations} />
        <FlyToSelected location={selectedLoc} />
        {validLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat!, loc.lng!]}
            icon={loc.id === selectedLocationId ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onLocationSelect?.(loc),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{loc.name}</p>
                <p className="text-gray-600">{loc.address}</p>
                <p className="font-semibold mt-1">${loc.price_per_hour}/hr</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ParkingMap;
