import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Droplets, Ruler, Phone, Map } from 'lucide-react';

interface Land {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  location: string;
  area_acres: number;
  soil_type: string | null;
  water_availability: string | null;
  price_per_month: number;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface LandCardProps {
  land: Land;
  isBuyer: boolean;
  isLoggedIn: boolean;
  onContactOwner: (land: Land) => void;
  onViewMap: (land: Land) => void;
}

export function LandCard({ land, isBuyer, isLoggedIn, onContactOwner, onViewMap }: LandCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-card transition-shadow">
      <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
        <MapPin className="w-16 h-16 text-primary/30" />
        {land.latitude && land.longitude && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-2 right-2"
            onClick={() => onViewMap(land)}
          >
            <Map className="w-4 h-4 mr-1" />
            View Map
          </Button>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">{land.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {land.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Ruler className="w-4 h-4" />
              {land.area_acres} acres
            </span>
            {land.water_availability && (
              <span className="flex items-center gap-1">
                <Droplets className="w-4 h-4" />
                {land.water_availability}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">₹{land.price_per_month.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
          {isBuyer && isLoggedIn && (
            <Button onClick={() => onContactOwner(land)}>
              <Phone className="w-4 h-4 mr-2" />
              Get Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
