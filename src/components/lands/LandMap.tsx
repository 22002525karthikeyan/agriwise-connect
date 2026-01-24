import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface LandMapViewProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
}

export function LandMapView({ latitude, longitude, title, location }: LandMapViewProps) {
  // Using OpenStreetMap iframe embed
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  
  return (
    <div className="space-y-3">
      <div className="h-64 w-full rounded-xl overflow-hidden border bg-muted">
        <iframe
          title={`Map of ${title}`}
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
      </div>
    </div>
  );
}

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState(latitude?.toString() || '');
  const [manualLng, setManualLng] = useState(longitude?.toString() || '');

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        onLocationChange(lat, lng);
        setIsLoading(false);
      },
      (err) => {
        setError('Unable to get location. Please enter manually.');
        setIsLoading(false);
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualChange = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onLocationChange(lat, lng);
      setError(null);
    } else {
      setError('Please enter valid coordinates');
    }
  };

  // Map preview URL
  const previewUrl = latitude && longitude 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02}%2C${latitude - 0.02}%2C${longitude + 0.02}%2C${latitude + 0.02}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : null;

  return (
    <div className="space-y-4">
      {/* Get Current Location Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGetCurrentLocation}
        disabled={isLoading}
      >
        <Navigation className="w-4 h-4 mr-2" />
        {isLoading ? 'Getting Location...' : 'Use My Current Location'}
      </Button>

      {/* Manual Entry */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="latitude" className="text-xs">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="e.g., 20.5937"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            onBlur={handleManualChange}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="longitude" className="text-xs">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="e.g., 78.9629"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            onBlur={handleManualChange}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Map Preview */}
      {latitude && longitude && previewUrl && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Location set: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
          <div className="h-32 w-full rounded-lg overflow-hidden border bg-muted">
            <iframe
              title="Location Preview"
              src={previewUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View on Google Maps
          </a>
        </div>
      )}

      {!latitude && !longitude && (
        <p className="text-xs text-muted-foreground text-center py-4 bg-muted rounded-lg">
          Use the button above or enter coordinates manually to set land location
        </p>
      )}
    </div>
  );
}
