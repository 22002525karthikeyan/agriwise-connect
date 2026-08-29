import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sprout, Bug, Droplets, ShoppingBag, TrendingUp, Calculator, Package,
  Thermometer, Activity, Gauge, Waves, Power
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { ProfileSetupCard } from '@/components/dashboard/ProfileSetupCard';

interface FarmerDashboardProps {
  fullName: string | null;
  onSignOut: () => void;
}

const sensorMetrics = [
  { label: 'Soil Moisture', value: '68', suffix: '%', icon: Droplets, trend: '+4%' },
  { label: 'Temperature', value: '24', suffix: '°C', icon: Thermometer, trend: '+1°' },
  { label: 'Humidity', value: '72', suffix: '%', icon: Waves, trend: '-2%' },
  { label: 'pH Value', value: '6.8', suffix: '', icon: Activity, trend: 'stable' },
  { label: 'Water Tank', value: '82', suffix: '%', icon: Gauge, trend: '-5%' },
  { label: 'Irrigation', value: 'ON', suffix: '', icon: Power, trend: 'live' },
];

export default function FarmerDashboard({ fullName, onSignOut }: FarmerDashboardProps) {
  const { t } = useTranslation();

  const quickActions = [
    {
      titleKey: 'features.cropPrediction',
      descKey: 'features.cropPredictionDesc',
      icon: Sprout,
      href: '/crop-prediction',
    },
    {
      titleKey: 'fertilizer.title',
      descKey: 'fertilizer.subtitle',
      icon: TrendingUp,
      href: '/fertilizer',
    },
    {
      titleKey: 'features.diseaseDetection',
      descKey: 'features.diseaseDetectionDesc',
      icon: Bug,
      href: '/disease-detection',
    },
    {
      titleKey: 'features.waterManagement',
      descKey: 'features.waterManagementDesc',
      icon: Droplets,
      href: '/water-management',
    },
    {
      titleKey: 'profit.title',
      descKey: 'profit.subtitle',
      icon: Calculator,
      href: '/profit-estimation',
    },
    {
      titleKey: 'marketplace.sellProduce',
      descKey: 'features.marketplaceDesc',
      icon: ShoppingBag,
      href: '/marketplace',
    },
    {
      titleKey: 'farmer.orders',
      descKey: 'farmer.manageOrders',
      icon: Package,
      href: '/orders',
    },
    {
      titleKey: 'lands.title',
      descKey: 'features.landRentalDesc',
      icon: MapPin,
      href: '/lands',
    },
  ];


  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-primary/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/8 blur-[140px] rounded-full" />
      </div>

      <DashboardHeader fullName={fullName} role="farmer" onSignOut={onSignOut} />

      <main className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-primary text-xs font-medium mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live Telemetry
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
              Welcome back, <span className="text-gradient-hero">{fullName?.split(' ')[0] || t('auth.farmer')}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Your farm's live intelligence at a glance.
            </p>
          </div>
        </motion.div>

        <ProfileSetupCard role="farmer" />

        {/* Sensor Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {sensorMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl glass hover:border-primary/40 transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <m.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{m.trend}</span>
              </div>
              <div className="font-display font-extrabold text-2xl leading-none">
                {m.value}<span className="text-sm text-muted-foreground font-normal ml-0.5">{m.suffix}</span>
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1.5">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Weather */}
        <WeatherCard />

        {/* Farm tools */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-display font-bold">{t('dashboard.farmTools')}</h2>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Modules</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.titleKey}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
              >
                <Link to={action.href}>
                  <Card className="h-full glass hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-transparent">
                    <CardHeader className="pb-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                        <action.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-display font-bold">{t(action.titleKey)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{t(action.descKey)}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
