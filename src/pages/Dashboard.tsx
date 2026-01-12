import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Leaf, 
  Sprout, 
  Bug, 
  Droplets, 
  ShoppingBag, 
  MapPin, 
  LogOut,
  TrendingUp,
  Sun,
  CloudRain
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const quickActions = [
    {
      title: 'Crop Prediction',
      description: 'Get AI-powered crop recommendations based on your soil and weather',
      icon: Sprout,
      href: '/crop-prediction',
      color: 'bg-agri-leaf/10 text-agri-leaf',
    },
    {
      title: 'Fertilizer Guide',
      description: 'Calculate optimal fertilizer requirements for your crops',
      icon: TrendingUp,
      href: '/fertilizer',
      color: 'bg-agri-gold/10 text-agri-earth',
    },
    {
      title: 'Disease Detection',
      description: 'Upload leaf images to detect diseases and get treatment advice',
      icon: Bug,
      href: '/disease-detection',
      color: 'bg-destructive/10 text-destructive',
    },
    {
      title: 'Browse Lands',
      description: 'Find agricultural land available for rent in your area',
      icon: MapPin,
      href: '/lands',
      color: 'bg-agri-earth/10 text-agri-earth',
    },
    {
      title: 'Marketplace',
      description: 'Buy and sell fresh produce directly without middlemen',
      icon: ShoppingBag,
      href: '/marketplace',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Water Management',
      description: 'Monitor soil moisture and optimize irrigation schedules',
      icon: Droplets,
      href: '/water-management',
      color: 'bg-agri-water/10 text-agri-water',
    },
  ];

  const weatherData = {
    temp: '28°C',
    condition: 'Partly Cloudy',
    humidity: '65%',
    rainfall: '2mm',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-serif font-bold text-foreground">AgriSmart</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-foreground">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'farmer'}</p>
              </div>
              <Button variant="outline" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Farmer'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your farm today.
          </p>
        </div>

        {/* Weather Card */}
        <Card className="mb-8 bg-gradient-hero text-primary-foreground shadow-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium opacity-90 mb-1">Today's Weather</h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">{weatherData.temp}</span>
                  <div className="text-sm opacity-80">
                    <p>{weatherData.condition}</p>
                    <p>Humidity: {weatherData.humidity}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <Sun className="w-8 h-8 mb-1 mx-auto" />
                  <p className="text-xs opacity-80">UV Index</p>
                  <p className="font-semibold">Moderate</p>
                </div>
                <div className="text-center">
                  <CloudRain className="w-8 h-8 mb-1 mx-auto" />
                  <p className="text-xs opacity-80">Rainfall</p>
                  <p className="font-semibold">{weatherData.rainfall}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="h-full hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-serif">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent Activity</CardTitle>
            <CardDescription>Your latest actions and predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Leaf className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity yet.</p>
              <p className="text-sm">Start by getting a crop recommendation!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
