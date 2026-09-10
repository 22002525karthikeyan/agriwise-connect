import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Droplets, Ruler, Phone, Map } from 'lucide-react';
import { DeleteButton } from '@/components/common/DeleteButton';
import { supabase } from '@/integrations/supabase/client';

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
  isOwner?: boolean;
  onContactOwner: (land: Land) => void;
  onViewMap: (land: Land) => void;
  onDelete?: (land: Land) => void;
}

export function LandCard({ land, isBuyer, isLoggedIn, isOwner, onContactOwner, onViewMap, onDelete }: LandCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const path = land.image_url;
    if (!path) {
      setImageSrc(null);
      return;
    }
    if (path.startsWith('http')) {
      setImageSrc(path);
      return;
    }
    supabase.storage
      .from('land-images')
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (active) setImageSrc(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [land.image_url]);

  return (
    <Card className="overflow-hidden hover:shadow-card transition-shadow">
      <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
        {imageSrc ? (
          <img src={imageSrc} alt={`Land photo: ${land.title}`} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <MapPin className="w-16 h-16 text-primary/30" />
        )}
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
          {isOwner && onDelete && (
            <DeleteButton
              label="Remove"
              title="Remove this land listing?"
              description={`"${land.title}" will be permanently deleted from the listings.`}
              onConfirm={() => onDelete(land)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

