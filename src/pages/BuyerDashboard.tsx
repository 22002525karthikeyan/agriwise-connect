import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ShoppingBag, Search } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { supabase } from '@/integrations/supabase/client';

interface BuyerDashboardProps {
  fullName: string | null;
  onSignOut: () => void;
}

export default function BuyerDashboard({ fullName, onSignOut }: BuyerDashboardProps) {
  const { t } = useTranslation();
  const [categoryCounts, setCategoryCounts] = useState({
    vegetables: 0,
    fruits: 0,
    grains: 0,
    lands: 0,
  });

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    // Fetch produce counts by category
    const { data: produceData } = await supabase
      .from('marketplace_listings')
      .select('crop_name')
      .eq('is_available', true);

    if (produceData) {
      const vegetables = produceData.filter(p => 
        ['tomato', 'potato', 'onion', 'carrot', 'cabbage', 'spinach', 'brinjal', 'cauliflower', 'beans', 'peas'].some(v => 
          p.crop_name.toLowerCase().includes(v)
        )
      ).length;
      const fruits = produceData.filter(p => 
        ['mango', 'banana', 'apple', 'orange', 'grape', 'papaya', 'guava', 'pomegranate', 'watermelon'].some(f => 
          p.crop_name.toLowerCase().includes(f)
        )
      ).length;
      const grains = produceData.filter(p => 
        ['rice', 'wheat', 'maize', 'corn', 'millet', 'barley', 'oats', 'sorghum'].some(g => 
          p.crop_name.toLowerCase().includes(g)
        )
      ).length;

      setCategoryCounts(prev => ({ ...prev, vegetables, fruits, grains }));
    }

    // Fetch lands count
    const { count: landsCount } = await supabase
      .from('lands')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);

    if (landsCount !== null) {
      setCategoryCounts(prev => ({ ...prev, lands: landsCount }));
    }
  };

  const quickActions = [
    {
      titleKey: 'buyer.browseLands',
      descKey: 'features.landRentalDesc',
      icon: MapPin,
      href: '/lands',
      color: 'bg-agri-earth/10 text-agri-earth',
    },
    {
      titleKey: 'buyer.freshProduce',
      descKey: 'features.marketplaceDesc',
      icon: ShoppingBag,
      href: '/marketplace',
      color: 'bg-agri-leaf/10 text-agri-leaf',
    },
  ];

  const featuredCategories = [
    { nameKey: 'marketplace.vegetables', emoji: '🥬', count: categoryCounts.vegetables, href: '/marketplace?category=vegetables' },
    { nameKey: 'marketplace.fruits', emoji: '🍎', count: categoryCounts.fruits, href: '/marketplace?category=fruits' },
    { nameKey: 'marketplace.grains', emoji: '🌾', count: categoryCounts.grains, href: '/marketplace?category=grains' },
    { nameKey: 'lands.title', emoji: '🏞️', count: categoryCounts.lands, href: '/lands' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader fullName={fullName} role="buyer" onSignOut={onSignOut} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            {t('dashboard.welcome')}, {fullName?.split(' ')[0] || t('auth.buyer')}! 🛒
          </h1>
          <p className="text-muted-foreground">
            {t('buyer.welcomeSubtitle')}
          </p>
        </div>

        {/* Featured Categories */}
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">{t('buyer.featuredCategories')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {featuredCategories.map((category) => (
            <Link key={category.nameKey} to={category.href}>
              <Card className="hover:shadow-card transition-all cursor-pointer hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <span className="text-4xl mb-3 block">{category.emoji}</span>
                  <p className="font-semibold text-foreground">{t(category.nameKey)}</p>
                  <p className="text-xs text-muted-foreground">{category.count} listings</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => (
            <Link key={action.titleKey} to={action.href}>
              <Card className="h-full hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl font-serif">{t(action.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{t(action.descKey)}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Search Prompt */}
        <Card className="mt-8 bg-gradient-hero text-primary-foreground">
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-serif font-semibold mb-1">{t('buyer.searchPrompt')}</h3>
              <p className="opacity-90">{t('buyer.searchDesc')}</p>
            </div>
            <Link 
              to="/marketplace" 
              className="flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <Search className="w-5 h-5" />
              {t('common.search')}
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
