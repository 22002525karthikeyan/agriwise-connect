import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Eye, DollarSign, Layers, TrendingUp } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LandownerDashboardProps {
  fullName: string | null;
  onSignOut: () => void;
}

interface Land {
  id: string;
  title: string;
  location: string;
  area_acres: number;
  price_per_month: number;
  is_available: boolean;
  soil_type: string | null;
}

export default function LandownerDashboard({ fullName, onSignOut }: LandownerDashboardProps) {
  const { user } = useAuth();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyLands();
    }
  }, [user]);

  const fetchMyLands = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('lands')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLands(data);
    }
    setLoading(false);
  };

  const stats = [
    { label: 'Total Lands', value: lands.length.toString(), icon: Layers, color: 'text-agri-earth' },
    { label: 'Available', value: lands.filter(l => l.is_available).length.toString(), icon: Eye, color: 'text-agri-leaf' },
    { label: 'Total Area', value: `${lands.reduce((sum, l) => sum + l.area_acres, 0)} acres`, icon: MapPin, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader fullName={fullName} role="landowner" onSignOut={onSignOut} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Welcome, {fullName?.split(' ')[0] || 'Landowner'}! 🏞️
            </h1>
            <p className="text-muted-foreground">
              Manage your land listings and connect with potential buyers.
            </p>
          </div>
          <Link to="/lands">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Land
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Card */}
        <Card className="mb-8 bg-gradient-hero text-primary-foreground shadow-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-medium opacity-90 mb-1">Potential Monthly Revenue</h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">
                    ₹{lands.filter(l => l.is_available).reduce((sum, l) => sum + l.price_per_month, 0).toLocaleString()}
                  </span>
                  <div className="text-sm opacity-80">
                    <p>From {lands.filter(l => l.is_available).length} available lands</p>
                  </div>
                </div>
              </div>
              <TrendingUp className="w-16 h-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* My Lands */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-foreground">My Land Listings</h2>
          <Link to="/lands" className="text-primary hover:underline text-sm font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your lands...</div>
        ) : lands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Lands Listed Yet</h3>
              <p className="text-muted-foreground mb-6">Start by adding your first land listing to reach potential buyers.</p>
              <Link to="/lands">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Land
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lands.slice(0, 6).map((land) => (
              <Card key={land.id} className="hover:shadow-card transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-serif">{land.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {land.location}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      land.is_available 
                        ? 'bg-agri-leaf/10 text-agri-leaf' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {land.is_available ? 'Available' : 'Rented'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{land.area_acres} acres</span>
                    <span className="font-semibold text-primary">₹{land.price_per_month.toLocaleString()}/mo</span>
                  </div>
                  {land.soil_type && (
                    <p className="text-xs text-muted-foreground mt-2">Soil: {land.soil_type}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-serif">Tips for Better Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-agri-leaf">✓</span>
                Add clear photos of your land to attract more buyers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-agri-leaf">✓</span>
                Mention water availability and soil type for better matches
              </li>
              <li className="flex items-start gap-2">
                <span className="text-agri-leaf">✓</span>
                Keep your pricing competitive with nearby listings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-agri-leaf">✓</span>
                Respond quickly to buyer inquiries for faster deals
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
