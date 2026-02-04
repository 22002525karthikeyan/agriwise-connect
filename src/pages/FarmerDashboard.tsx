import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Bug, Droplets, ShoppingBag, TrendingUp, Calculator } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { OrderNotifications } from '@/components/dashboard/OrderNotifications';
import { ProfileSetupCard } from '@/components/dashboard/ProfileSetupCard';

interface FarmerDashboardProps {
  fullName: string | null;
  onSignOut: () => void;
}

export default function FarmerDashboard({ fullName, onSignOut }: FarmerDashboardProps) {
  const { t } = useTranslation();

  const quickActions = [
    {
      titleKey: 'features.cropPrediction',
      descKey: 'features.cropPredictionDesc',
      icon: Sprout,
      href: '/crop-prediction',
      color: 'bg-agri-leaf/10 text-agri-leaf',
    },
    {
      titleKey: 'fertilizer.title',
      descKey: 'fertilizer.subtitle',
      icon: TrendingUp,
      href: '/fertilizer',
      color: 'bg-agri-gold/10 text-agri-earth',
    },
    {
      titleKey: 'features.diseaseDetection',
      descKey: 'features.diseaseDetectionDesc',
      icon: Bug,
      href: '/disease-detection',
      color: 'bg-destructive/10 text-destructive',
    },
    {
      titleKey: 'features.waterManagement',
      descKey: 'features.waterManagementDesc',
      icon: Droplets,
      href: '/water-management',
      color: 'bg-agri-water/10 text-agri-water',
    },
    {
      titleKey: 'profit.title',
      descKey: 'profit.subtitle',
      icon: Calculator,
      href: '/profit-estimation',
      color: 'bg-primary/10 text-primary',
    },
    {
      titleKey: 'marketplace.sellProduce',
      descKey: 'features.marketplaceDesc',
      icon: ShoppingBag,
      href: '/marketplace',
      color: 'bg-agri-gold/10 text-agri-earth',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader fullName={fullName} role="farmer" onSignOut={onSignOut} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            {t('dashboard.welcome')}, {fullName?.split(' ')[0] || t('auth.farmer')}! 🌾
          </h1>
          <p className="text-muted-foreground">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Profile Setup Alert */}
        <ProfileSetupCard role="farmer" />

        {/* Weather Card */}
        <div className="mb-8">
          <WeatherCard />
        </div>

        {/* Order Notifications */}
        <div className="mb-8">
          <OrderNotifications />
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">{t('dashboard.farmTools')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.titleKey} to={action.href}>
              <Card className="h-full hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-serif">{t(action.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t(action.descKey)}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
