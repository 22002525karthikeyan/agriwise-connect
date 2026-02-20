import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Leaf,
  FlaskConical,
  Shield,
  Wrench,
  Package,
  Star,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AgriInput {
  id: string;
  seller_id: string;
  name: string;
  category: string;
  description: string | null;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  brand: string | null;
  image_url: string | null;
  is_available: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; emoji: string }> = {
  seeds: { label: 'Seeds', icon: Leaf, color: 'bg-agri-leaf/10 text-agri-leaf', emoji: '🌱' },
  fertilizers: { label: 'Fertilizers', icon: FlaskConical, color: 'bg-agri-gold/10 text-agri-earth', emoji: '🧪' },
  pesticides: { label: 'Pesticides', icon: Shield, color: 'bg-destructive/10 text-destructive', emoji: '🛡️' },
  tools: { label: 'Tools', icon: Wrench, color: 'bg-blue-500/10 text-blue-600', emoji: '🔧' },
  other: { label: 'Other', icon: Package, color: 'bg-muted text-muted-foreground', emoji: '📦' },
};

// Static seed products for immediate browsing
const STATIC_PRODUCTS: AgriInput[] = [
  { id: 's1', seller_id: '', name: 'Hybrid Tomato Seeds', category: 'seeds', description: 'High-yield hybrid variety, disease resistant, suitable for all seasons.', price_per_unit: 350, unit: 'packet', quantity_available: 200, brand: 'Syngenta', image_url: null, is_available: true },
  { id: 's2', seller_id: '', name: 'Basmati Rice Seeds', category: 'seeds', description: 'Premium quality Basmati seeds with excellent aroma and long grain.', price_per_unit: 120, unit: 'kg', quantity_available: 500, brand: 'IARI', image_url: null, is_available: true },
  { id: 's3', seller_id: '', name: 'Wheat Seeds (HD-2967)', category: 'seeds', description: 'High protein content wheat variety, ideal for north Indian climate.', price_per_unit: 85, unit: 'kg', quantity_available: 1000, brand: 'ICAR', image_url: null, is_available: true },
  { id: 's4', seller_id: '', name: 'Onion Seeds', category: 'seeds', description: 'Early maturing variety, good shelf life and uniform bulb size.', price_per_unit: 480, unit: 'packet', quantity_available: 150, brand: 'Mahyco', image_url: null, is_available: true },
  { id: 's5', seller_id: '', name: 'BT Cotton Seeds', category: 'seeds', description: 'Bollworm resistant variety with high fiber quality.', price_per_unit: 650, unit: 'packet', quantity_available: 300, brand: 'Monsanto', image_url: null, is_available: true },
  { id: 's6', seller_id: '', name: 'Maize Seeds (NK-6240)', category: 'seeds', description: 'High starch content, suitable for fodder and grain purpose.', price_per_unit: 200, unit: 'kg', quantity_available: 400, brand: 'Syngenta', image_url: null, is_available: true },
  { id: 'f1', seller_id: '', name: 'DAP Fertilizer', category: 'fertilizers', description: 'Di-Ammonium Phosphate, excellent source of phosphorus and nitrogen for all crops.', price_per_unit: 1350, unit: '50kg bag', quantity_available: 800, brand: 'IFFCO', image_url: null, is_available: true },
  { id: 'f2', seller_id: '', name: 'Urea (46% N)', category: 'fertilizers', description: 'High nitrogen content fertilizer, promotes vegetative growth.', price_per_unit: 266, unit: '45kg bag', quantity_available: 1200, brand: 'NFL', image_url: null, is_available: true },
  { id: 'f3', seller_id: '', name: 'NPK 19-19-19', category: 'fertilizers', description: 'Balanced water-soluble fertilizer for foliar and drip irrigation.', price_per_unit: 1800, unit: '25kg bag', quantity_available: 600, brand: 'Coromandel', image_url: null, is_available: true },
  { id: 'f4', seller_id: '', name: 'Vermicompost', category: 'fertilizers', description: 'Organic enriched compost, improves soil texture and microbial activity.', price_per_unit: 18, unit: 'kg', quantity_available: 2000, brand: 'Organic India', image_url: null, is_available: true },
  { id: 'f5', seller_id: '', name: 'Potassium Sulphate (SOP)', category: 'fertilizers', description: 'Chloride-free potassium source, ideal for quality crops like fruits and vegetables.', price_per_unit: 2400, unit: '25kg bag', quantity_available: 400, brand: 'SQM', image_url: null, is_available: true },
  { id: 'f6', seller_id: '', name: 'Boron Micronutrient', category: 'fertilizers', description: 'Corrects boron deficiency in oilseeds, vegetables and pulses.', price_per_unit: 90, unit: 'kg', quantity_available: 300, brand: 'Boric', image_url: null, is_available: true },
  { id: 'p1', seller_id: '', name: 'Neem Oil Pesticide', category: 'pesticides', description: 'Organic bio-pesticide, effective against aphids, whiteflies and mites.', price_per_unit: 280, unit: 'litre', quantity_available: 500, brand: 'GreenKure', image_url: null, is_available: true },
  { id: 'p2', seller_id: '', name: 'Chlorpyrifos 20% EC', category: 'pesticides', description: 'Broad spectrum insecticide for soil and foliar application.', price_per_unit: 350, unit: 'litre', quantity_available: 400, brand: 'Dhanuka', image_url: null, is_available: true },
  { id: 'p3', seller_id: '', name: 'Mancozeb 75% WP', category: 'pesticides', description: 'Contact fungicide for controlling early and late blight.', price_per_unit: 180, unit: 'kg', quantity_available: 600, brand: 'Indofil', image_url: null, is_available: true },
  { id: 'p4', seller_id: '', name: 'Trichoderma Viride', category: 'pesticides', description: 'Bio-fungicide for soil treatment and seed treatment against root rot.', price_per_unit: 150, unit: 'kg', quantity_available: 350, brand: 'T-Stanes', image_url: null, is_available: true },
  { id: 't1', seller_id: '', name: 'Drip Irrigation Kit (1 Acre)', category: 'tools', description: 'Complete drip irrigation set with pipes, emitters, filters for 1 acre coverage.', price_per_unit: 4500, unit: 'set', quantity_available: 100, brand: 'Jain Irrigation', image_url: null, is_available: true },
  { id: 't2', seller_id: '', name: 'Manual Sprayer (16L)', category: 'tools', description: '16 litre capacity knapsack sprayer with adjustable nozzle.', price_per_unit: 750, unit: 'piece', quantity_available: 200, brand: 'Solo', image_url: null, is_available: true },
  { id: 't3', seller_id: '', name: 'Soil pH Testing Kit', category: 'tools', description: 'Easy to use kit for measuring soil pH, comes with 100 test strips.', price_per_unit: 350, unit: 'kit', quantity_available: 150, brand: 'LaMotte', image_url: null, is_available: true },
  { id: 't4', seller_id: '', name: 'Electric Sprayer Pump', category: 'tools', description: 'Battery operated sprayer with 16L tank, 6-8 hours working time.', price_per_unit: 3200, unit: 'piece', quantity_available: 80, brand: 'Neptune', image_url: null, is_available: true },
];

export default function AgriInputsStore() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dbProducts, setDbProducts] = useState<AgriInput[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<AgriInput | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [profile, setProfile] = useState<{ address: string | null } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDbProducts();
      fetchProfile();
    }
  }, [user]);

  const fetchDbProducts = async () => {
    const { data } = await supabase
      .from('agri_inputs' as any)
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });
    if (data) setDbProducts(data as unknown as AgriInput[]);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('address')
      .eq('id', user.id)
      .single();
    if (data) {
      setProfile(data);
      if (data.address) setDeliveryAddress(data.address);
    }
  };

  const allProducts = [...STATIC_PRODUCTS, ...dbProducts];

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand?.toLowerCase().includes(search.toLowerCase())) ||
      (p.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openOrder = (product: AgriInput) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setOrderSuccess(false);
    setOrderDialogOpen(true);
  };

  const placeOrder = async () => {
    if (!user || !selectedProduct) return;
    if (!deliveryAddress.trim()) {
      toast({ title: 'Address required', description: 'Please enter a delivery address.', variant: 'destructive' });
      return;
    }

    setOrdering(true);
    const totalAmount = selectedProduct.price_per_unit * orderQuantity;

    // For DB products with real seller_id, create order; for static, just simulate
    if (selectedProduct.seller_id) {
      const { error } = await supabase
        .from('agri_input_orders' as any)
        .insert({
          buyer_id: user.id,
          seller_id: selectedProduct.seller_id,
          input_id: selectedProduct.id,
          quantity: orderQuantity,
          unit: selectedProduct.unit,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
        });
      if (error) {
        toast({ title: 'Order failed', description: error.message, variant: 'destructive' });
        setOrdering(false);
        return;
      }
    }

    setOrdering(false);
    setOrderSuccess(true);
    toast({
      title: '🎉 Order Placed!',
      description: `Your order for ${selectedProduct.name} has been placed successfully.`,
    });
  };

  const categoryCounts = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
    acc[cat] = allProducts.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const getCategoryConfig = (cat: string) => CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-agri-leaf/10 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-agri-leaf" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-foreground">Agricultural Inputs Store</h1>
                <p className="text-sm text-muted-foreground">Seeds, Fertilizers, Pesticides & Tools</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Category summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(activeCategory === key ? 'all' : key)}
                className={`rounded-xl p-3 border text-left transition-all duration-200 ${
                  activeCategory === key
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.color} mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="font-medium text-sm text-foreground">{cfg.label}</p>
                <p className="text-xs text-muted-foreground">{categoryCounts[key] || 0} items</p>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search seeds, fertilizers, tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tab filter */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="all" className="text-xs">🌾 All ({allProducts.length})</TabsTrigger>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {cfg.emoji} {cfg.label} ({categoryCounts[key] || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No products found. Try a different search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => {
                  const cfg = getCategoryConfig(product.category);
                  const Icon = cfg.icon;
                  return (
                    <Card key={product.id} className="flex flex-col hover:shadow-card transition-all duration-200 hover:-translate-y-0.5">
                      {/* Product visual */}
                      <div className={`h-28 rounded-t-lg flex items-center justify-center ${cfg.color} text-5xl`}>
                        {cfg.emoji}
                      </div>
                      <CardContent className="flex flex-col flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm leading-tight">{product.name}</h3>
                          <Badge variant="outline" className={`text-xs shrink-0 ${cfg.color}`}>
                            {cfg.label}
                          </Badge>
                        </div>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground mb-2">by {product.brand}</p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            <p className="text-lg font-bold text-primary">₹{product.price_per_unit.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">per {product.unit}</p>
                          </div>
                          <Button size="sm" onClick={() => openOrder(product)} className="gap-1">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Order
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {product.quantity_available} {product.unit}(s) available
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={open => { setOrderDialogOpen(open); if (!open) setOrderSuccess(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Place Order
            </DialogTitle>
          </DialogHeader>

          {orderSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-agri-leaf/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-agri-leaf" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground">Order Placed!</h3>
              <p className="text-muted-foreground text-sm">
                Your order for <strong>{selectedProduct?.name}</strong> has been confirmed. The seller will contact you shortly.
              </p>
              <Button className="w-full" onClick={() => setOrderDialogOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : selectedProduct ? (
            <div className="space-y-5">
              {/* Product summary */}
              <div className="p-4 bg-muted rounded-xl flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getCategoryConfig(selectedProduct.category).color}`}>
                  {getCategoryConfig(selectedProduct.category).emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{selectedProduct.name}</h4>
                  {selectedProduct.brand && <p className="text-xs text-muted-foreground">by {selectedProduct.brand}</p>}
                  <p className="text-primary font-bold">₹{selectedProduct.price_per_unit.toLocaleString()} / {selectedProduct.unit}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity ({selectedProduct.unit})</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOrderQuantity(q => Math.max(1, q - 1))}
                  >-</Button>
                  <Input
                    type="number"
                    value={orderQuantity}
                    onChange={e => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                    className="text-center w-24"
                    min={1}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOrderQuantity(q => q + 1)}
                  >+</Button>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                <span className="font-medium text-foreground">Total Amount</span>
                <span className="text-xl font-bold text-primary">
                  ₹{(selectedProduct.price_per_unit * orderQuantity).toLocaleString()}
                </span>
              </div>

              {/* Delivery address */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </Label>
                <Textarea
                  placeholder="Enter your delivery address..."
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={placeOrder}
                disabled={ordering}
              >
                {ordering ? 'Placing Order...' : `Place Order · ₹${(selectedProduct.price_per_unit * orderQuantity).toLocaleString()}`}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
