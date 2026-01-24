import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LandMapViewProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
}

export function LandMapView({ latitude, longitude, title, location }: LandMapViewProps) {
  const position: LatLngExpression = [latitude, longitude];

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={defaultIcon}>
          <Popup>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-muted-foreground">{location}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  // Default to center of India if no location set
  const defaultCenter: LatLngExpression = [20.5937, 78.9629];
  const position: LatLngExpression | null = latitude && longitude ? [latitude, longitude] : null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Click on the map to set land location</p>
      <div className="h-48 w-full rounded-xl overflow-hidden border">
        <MapContainer 
          center={position || defaultCenter} 
          zoom={position ? 13 : 5} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationChange={onLocationChange} />
          {position && (
            <Marker position={position} icon={defaultIcon}>
              <Popup>Selected location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      {latitude && longitude && (
        <p className="text-xs text-muted-foreground">
          📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
