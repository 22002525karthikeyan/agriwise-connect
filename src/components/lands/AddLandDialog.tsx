import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LocationPicker } from './LandMap';
import { Plus } from 'lucide-react';

interface NewLandData {
  title: string;
  description: string;
  location: string;
  area_acres: string;
  soil_type: string;
  water_availability: string;
  price_per_month: string;
  latitude: number | null;
  longitude: number | null;
}

interface AddLandDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewLandData) => void;
}

export function AddLandDialog({ isOpen, onOpenChange, onSubmit }: AddLandDialogProps) {
  const [newLand, setNewLand] = useState<NewLandData>({
    title: '',
    description: '',
    location: '',
    area_acres: '',
    soil_type: '',
    water_availability: '',
    price_per_month: '',
    latitude: null,
    longitude: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newLand);
    setNewLand({
      title: '',
      description: '',
      location: '',
      area_acres: '',
      soil_type: '',
      water_availability: '',
      price_per_month: '',
      latitude: null,
      longitude: null,
    });
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setNewLand({ ...newLand, latitude: lat, longitude: lng });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Land
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Add New Land Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Fertile Farmland near River"
              value={newLand.title}
              onChange={(e) => setNewLand({ ...newLand, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Village, District, State"
              value={newLand.location}
              onChange={(e) => setNewLand({ ...newLand, location: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area (acres)</Label>
              <Input
                id="area"
                type="number"
                placeholder="e.g., 5"
                value={newLand.area_acres}
                onChange={(e) => setNewLand({ ...newLand, area_acres: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price/month (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 10000"
                value={newLand.price_per_month}
                onChange={(e) => setNewLand({ ...newLand, price_per_month: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soil">Soil Type</Label>
              <Select value={newLand.soil_type} onValueChange={(v) => setNewLand({ ...newLand, soil_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alluvial">Alluvial</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="laterite">Laterite</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="loamy">Loamy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="water">Water Availability</Label>
              <Select value={newLand.water_availability} onValueChange={(v) => setNewLand({ ...newLand, water_availability: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="canal">Canal Irrigation</SelectItem>
                  <SelectItem value="borewell">Borewell</SelectItem>
                  <SelectItem value="river">River Nearby</SelectItem>
                  <SelectItem value="rainfed">Rainfed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Map Location Picker */}
          <div className="space-y-2">
            <Label>Land Location on Map</Label>
            <LocationPicker
              latitude={newLand.latitude}
              longitude={newLand.longitude}
              onLocationChange={handleLocationChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the land, previous crops grown, etc."
              value={newLand.description}
              onChange={(e) => setNewLand({ ...newLand, description: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">List Land</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
