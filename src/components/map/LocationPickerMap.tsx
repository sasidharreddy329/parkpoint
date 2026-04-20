import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AddressSearch from "./AddressSearch";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerMapProps {
  value: { lat: number; lng: number } | null;
  onChange: (pos: { lat: number; lng: number }) => void;
  onAddressFound?: (address: string) => void;
  className?: string;
}

function ClickHandler({ onChange }: { onChange: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyToValue({ value }: { value: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.flyTo([value.lat, value.lng], 15, { duration: 0.8 });
  }, [value, map]);
  return null;
}

const LocationPickerMap = ({ value, onChange, onAddressFound, className }: LocationPickerMapProps) => {
  const center: [number, number] = value ? [value.lat, value.lng] : [20.5937, 78.9629];

  return (
    <div className="space-y-2">
      <AddressSearch
        placeholder="Search address to set location…"
        onSelect={(r) => {
          onChange({ lat: r.lat, lng: r.lng });
          onAddressFound?.(r.label);
        }}
      />
      <div className={`rounded-xl overflow-hidden border border-border ${className || ""}`}>
        <MapContainer center={center} zoom={value ? 15 : 5} className="w-full h-full z-0" style={{ minHeight: "250px" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          <FlyToValue value={value} />
          {value && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPickerMap;
