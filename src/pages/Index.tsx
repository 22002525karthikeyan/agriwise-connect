import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Leaf, Sprout, Bug, Droplets, ShoppingBag, MapPin, ArrowRight,
  Satellite, Zap, TrendingUp, Activity, Star
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

function FloatingLeaves() {
  const leaves = Array.from({ length: 8 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {leaves.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/20"
          initial={{
            x: `${(i * 137) % 100}%`,
            y: `${(i * 53) % 100}%`,
            rotate: 0,
          }}
          animate={{
            y: [`${(i * 53) % 100}%`, `${((i * 53) % 100) - 15}%`, `${(i * 53) % 100}%`],
            rotate: [0, 15, -10, 0],
          }}
          transition={{
            duration: 12 + (i % 5) * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.7,
          }}
        >
          <Leaf className="w-8 h-8" />
        </motion.div>
      ))}
    </div>
  );
}

function StatCounter({ value, label, suffix = '' }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-display font-extrabold text-gradient-hero">
        {value}{suffix}
      </div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function Index() {
  const { t } = useTranslation();

  const features = [
    { icon: Sprout, titleKey: 'features.cropPrediction', descKey: 'features.cropPredictionDesc' },
    { icon: Bug, titleKey: 'features.diseaseDetection', descKey: 'features.diseaseDetectionDesc' },
    { icon: Droplets, titleKey: 'features.waterManagement', descKey: 'features.waterManagementDesc' },
    { icon: MapPin, titleKey: 'features.landRental', descKey: 'features.landRentalDesc' },
    { icon: ShoppingBag, titleKey: 'features.marketplace', descKey: 'features.marketplaceDesc' },
    { icon: Satellite, titleKey: 'features.cropPrediction', descKey: 'features.cropPredictionDesc' },
  ];

  const steps = [
    { n: '01', title: 'Connect', desc: 'Sign up as farmer, buyer, or landowner in minutes.' },
    { n: '02', title: 'Analyze', desc: 'AI reads soil, weather, and imagery to guide decisions.' },
    { n: '03', title: 'Grow', desc: 'Optimize yield, sell direct, and track everything live.' },
  ];

  const testimonials = [
    { name: 'Ravi K.', role: 'Farmer, Punjab', quote: 'The crop prediction increased my yield by 22% last season. Feels like having an agronomist in my pocket.' },
    { name: 'Meera S.', role: 'Buyer, Mumbai', quote: 'Direct from the farm, no middlemen, and quality I can trust. Game changer for my restaurant.' },
    { name: 'Arjun P.', role: 'Landowner, Karnataka', quote: 'Listed my land and had three verified farmers within a week. The map view is fantastic.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary/15 dark:bg-primary/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent/10 blur-[140px] rounded-full" />
      </div>

      {/* Sticky Nav */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-primary rounded-xl blur-md opacity-40 animate-pulse-glow" />
              <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-lg font-display font-extrabold tracking-tight">AgriSmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" size="sm">{t('common.signIn')}</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="rounded-full glow-primary">
                {t('common.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero — Split layout */}
      <section className="relative z-10 pt-32 md:pt-36 pb-20 px-4">
        <FloatingLeaves />
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-primary text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Autonomous Crop Intelligence
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-display font-extrabold leading-[1.05] tracking-tight">
              The Future of{' '}
              <span className="text-gradient-hero">Precision Farming</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              AI-driven crop recommendations, IoT irrigation, and a direct marketplace —
              built for farmers, buyers, and landowners who want to grow smarter.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="rounded-xl glow-primary text-base font-semibold">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="rounded-xl glass text-base">
                  Explore Features
                </Button>
              </a>
            </div>

            <div className="pt-6 flex items-center gap-8 border-t border-border/40">
              <StatCounter value="10K" suffix="+" label="Active Farmers" />
              <StatCounter value="5K" suffix="+" label="Land Listings" />
              <StatCounter value="95" suffix="%" label="AI Accuracy" />
            </div>
          </motion.div>

          {/* Right: dashboard preview bento */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-7 grid grid-cols-2 gap-4"
          >
            {/* Big metric */}
            <div className="col-span-2 p-6 rounded-3xl glass-strong shadow-elevated hover:border-primary/40 transition-colors group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Soil Saturation Index</p>
                  <h3 className="text-4xl font-display font-extrabold">
                    84.2<span className="text-lg text-muted-foreground font-normal">%</span>
                  </h3>
                </div>
                <div className="h-14 w-28 flex items-end gap-1.5">
                  {[50, 75, 100, 66, 90, 55].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-primary/30 rounded-t-sm group-hover:bg-primary/60 transition-all"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                    />
                  ))}
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                />
              </div>
            </div>

            {/* Small metric 1 */}
            <div className="p-6 rounded-3xl glass hover:border-primary/40 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Predictive Yield</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                +12% growth projected in Sector 4B by optimizing nitrogen.
              </p>
            </div>

            {/* Small metric 2 */}
            <div className="p-6 rounded-3xl glass hover:border-primary/40 transition-all hover:-translate-y-1">
              <div className="w-full h-20 rounded-xl bg-background/60 mb-4 overflow-hidden relative border border-border/40 flex items-center justify-center">
                <motion.div
                  className="w-14 h-14 border border-primary/40 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <div className="absolute w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
              </div>
              <h4 className="font-semibold mb-1">Live Telemetry</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Satellite linkage active. 0.4s latency north.
              </p>
            </div>

            {/* Bottom strip metrics */}
            <div className="col-span-2 grid grid-cols-4 gap-3">
              {[
                { label: 'Temp', value: '24°', icon: Activity },
                { label: 'Humidity', value: '72%', icon: Droplets },
                { label: 'pH', value: '6.8', icon: Sprout },
                { label: 'Yield', value: '+18%', icon: TrendingUp },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-2xl glass-subtle text-center">
                  <m.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="font-display font-bold text-sm">{m.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-3">Platform</p>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold">
              Everything you need to <span className="text-gradient-hero">farm better</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.titleKey + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-7 rounded-3xl glass hover:border-primary/40 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-bold mb-2">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-3">Workflow</p>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl glass relative"
              >
                <div className="text-6xl font-display font-extrabold text-gradient-hero opacity-70 mb-3">{s.n}</div>
                <h3 className="text-xl font-display font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-3">Loved by growers</p>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold">Trusted across the field</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-7 rounded-3xl glass"
              >
                <div className="flex gap-1 mb-4 text-primary">
                  {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="pt-4 border-t border-border/40">
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[2rem] p-12 md:p-16 overflow-hidden bg-gradient-hero text-primary-foreground text-center shadow-elevated">
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-4">
                Ready to transform your farming?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join thousands of farmers already increasing yields with AgriSmart.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="rounded-xl text-base font-semibold px-8">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-border/40">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">AgriSmart</span>
          </div>
          <p>© {new Date().getFullYear()} AgriSmart. Empowering farmers with technology.</p>
        </div>
      </footer>
    </div>
  );
}
