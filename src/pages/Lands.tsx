import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Leaf, Phone, Mail, User } from 'lucide-react';
import { LandCard } from '@/components/lands/LandCard';
import { AddLandDialog } from '@/components/lands/AddLandDialog';
import { LandMapView } from '@/components/lands/LandMap';

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

interface OwnerContact {
  full_name: string | null;
  phone: string | null;
  email: string;
}

export default function Lands() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [lands, setLands] = useState<Land[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState<Land | null>(null);
  const [ownerContact, setOwnerContact] = useState<OwnerContact | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('lands')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLands(data);
    }
    setIsLoading(false);
  };

  const handleAddLand = async (newLand: {
    title: string;
    description: string;
    location: string;
    area_acres: string;
    soil_type: string;
    water_availability: string;
    price_per_month: string;
    latitude: number | null;
    longitude: number | null;
  }) => {
    if (!user) return;

    const { error } = await supabase.from('lands').insert({
      owner_id: user.id,
      title: newLand.title,
      description: newLand.description || null,
      location: newLand.location,
      area_acres: parseFloat(newLand.area_acres),
      soil_type: newLand.soil_type || null,
      water_availability: newLand.water_availability || null,
      price_per_month: parseFloat(newLand.price_per_month),
      latitude: newLand.latitude,
      longitude: newLand.longitude,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add land listing',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Land listing added successfully',
      });
      setIsDialogOpen(false);
      fetchLands();
    }
  };

  const handleContactOwner = async (land: Land) => {
    setSelectedLand(land);
    setLoadingContact(true);
    setContactDialogOpen(true);

    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, email')
      .eq('id', land.owner_id)
      .single();

    if (data) {
      setOwnerContact(data);
    }
    setLoadingContact(false);

    if (user) {
      await supabase.from('buyer_inquiries').insert({
        buyer_id: user.id,
        seller_id: land.owner_id,
        listing_type: 'land',
        listing_id: land.id,
        message: 'Viewed contact details',
      });
    }
  };

  const handleViewMap = (land: Land) => {
    setSelectedLand(land);
    setMapDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-agri-earth/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-agri-earth" />
                </div>
                <div>
                  <h1 className="text-lg font-serif font-bold text-foreground">Land Listings</h1>
                  <p className="text-xs text-muted-foreground">Find or list agricultural land</p>
                </div>
              </div>
            </div>
            
            {profile?.role === 'landowner' && (
              <AddLandDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleAddLand}
              />
            )}
          </div>
        </div>
      </header>

      {/* Contact Owner Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Landowner Contact
            </DialogTitle>
          </DialogHeader>
          {loadingContact ? (
            <div className="py-8 text-center text-muted-foreground">Loading contact details...</div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Land</p>
                <p className="font-semibold text-foreground">{selectedLand?.title}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {selectedLand?.location}
                </p>
              </div>

              {ownerContact?.phone ? (
                <div className="space-y-3">
                  <div className="p-4 border rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{ownerContact.full_name || 'Landowner'}</p>
                        <p className="text-sm text-muted-foreground">Property Owner</p>
                      </div>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <a 
                        href={`tel:${ownerContact.phone}`}
                        className="flex items-center gap-3 p-3 bg-agri-leaf/10 rounded-lg hover:bg-agri-leaf/20 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-agri-leaf" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium text-foreground">{ownerContact.phone}</p>
                        </div>
                      </a>
                      <a 
                        href={`mailto:${ownerContact.email}`}
                        className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium text-foreground">{ownerContact.email}</p>
                        </div>
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Contact the landowner directly to discuss the property
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Contact Not Available</h3>
                  <p className="text-sm text-muted-foreground">
                    The landowner has not added their contact details yet. 
                    Please check back later.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Map View Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Land Location
            </DialogTitle>
          </DialogHeader>
          {selectedLand && selectedLand.latitude && selectedLand.longitude && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-xl">
                <p className="font-semibold text-foreground">{selectedLand.title}</p>
                <p className="text-sm text-muted-foreground">{selectedLand.location}</p>
              </div>
              <LandMapView
                latitude={selectedLand.latitude}
                longitude={selectedLand.longitude}
                title={selectedLand.title}
                location={selectedLand.location}
              />
              <Button
                className="w-full"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedLand.latitude},${selectedLand.longitude}`,
                    '_blank'
                  );
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Directions in Google Maps
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <Leaf className="w-12 h-12 text-primary" />
              <p className="text-muted-foreground">Loading lands...</p>
            </div>
          </div>
        ) : lands.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No lands available</h3>
              <p className="text-muted-foreground">Check back later for new listings</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands.map((land) => (
              <LandCard
                key={land.id}
                land={land}
                isBuyer={profile?.role === 'buyer'}
                isLoggedIn={!!user}
                onContactOwner={handleContactOwner}
                onViewMap={handleViewMap}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
