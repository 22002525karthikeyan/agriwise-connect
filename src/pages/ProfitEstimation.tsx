import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calculator, Loader2, TrendingUp, IndianRupee, Leaf, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Crop yield data (kg per acre) and market prices (₹ per kg)
const cropData: Record<string, { yieldPerAcre: number; marketPrice: number; season: string }> = {
  rice: { yieldPerAcre: 2000, marketPrice: 22, season: 'Kharif' },
  wheat: { yieldPerAcre: 1800, marketPrice: 25, season: 'Rabi' },
  maize: { yieldPerAcre: 2500, marketPrice: 18, season: 'Kharif' },
  sugarcane: { yieldPerAcre: 35000, marketPrice: 3.5, season: 'Annual' },
  cotton: { yieldPerAcre: 500, marketPrice: 65, season: 'Kharif' },
  soybean: { yieldPerAcre: 1000, marketPrice: 45, season: 'Kharif' },
  groundnut: { yieldPerAcre: 1200, marketPrice: 55, season: 'Kharif' },
  potato: { yieldPerAcre: 8000, marketPrice: 15, season: 'Rabi' },
  tomato: { yieldPerAcre: 10000, marketPrice: 20, season: 'All Season' },
  onion: { yieldPerAcre: 6000, marketPrice: 18, season: 'Rabi' },
  mustard: { yieldPerAcre: 600, marketPrice: 55, season: 'Rabi' },
  chickpea: { yieldPerAcre: 800, marketPrice: 50, season: 'Rabi' },
};

interface CropEstimation {
  crop: string;
  totalYield: number;
  totalInvestment: number;
  expectedIncome: number;
  netProfit: number;
  profitMargin: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export default function ProfitEstimation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [estimations, setEstimations] = useState<CropEstimation[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    landArea: '',
    fertilizerCost: '',
    waterCost: '',
    laborCost: '',
    seedCost: '',
    pesticideCost: '',
    transportCost: '',
    otherCosts: '',
  });

  const toggleCropSelection = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : prev.length < 5 ? [...prev, crop] : prev
    );
  };

  const calculateEstimation = (crop: string, landArea: number, costs: typeof formData): CropEstimation => {
    const data = cropData[crop];
    const totalYield = data.yieldPerAcre * landArea;
    
    const fertilizerCost = parseFloat(costs.fertilizerCost) || 0;
    const waterCost = parseFloat(costs.waterCost) || 0;
    const laborCost = parseFloat(costs.laborCost) || 0;
    const seedCost = parseFloat(costs.seedCost) || 0;
    const pesticideCost = parseFloat(costs.pesticideCost) || 0;
    const transportCost = parseFloat(costs.transportCost) || 0;
    const otherCosts = parseFloat(costs.otherCosts) || 0;

    const totalInvestment = fertilizerCost + waterCost + laborCost + seedCost + pesticideCost + transportCost + otherCosts;
    const expectedIncome = totalYield * data.marketPrice;
    const netProfit = expectedIncome - totalInvestment;
    const profitMargin = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
    if (profitMargin > 50) riskLevel = 'Low';
    else if (profitMargin < 20) riskLevel = 'High';

    return {
      crop,
      totalYield,
      totalInvestment,
      expectedIncome,
      netProfit,
      profitMargin,
      riskLevel,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (selectedCrops.length === 0) {
      toast({
        title: t('common.error'),
        description: t('profit.selectCropError'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const landArea = parseFloat(formData.landArea);
      const results: CropEstimation[] = selectedCrops.map(crop => 
        calculateEstimation(crop, landArea, formData)
      );

      // Sort by profit
      results.sort((a, b) => b.netProfit - a.netProfit);
      setEstimations(results);

      // Save the best crop estimation to database
      const best = results[0];
      const { error } = await supabase.from('profit_estimations').insert({
        user_id: user.id,
        crop_name: best.crop,
        land_area: landArea,
        expected_yield_per_acre: cropData[best.crop].yieldPerAcre,
        total_yield: best.totalYield,
        fertilizer_cost: parseFloat(formData.fertilizerCost) || 0,
        water_cost: parseFloat(formData.waterCost) || 0,
        labor_cost: parseFloat(formData.laborCost) || 0,
        seed_cost: parseFloat(formData.seedCost) || 0,
        pesticide_cost: parseFloat(formData.pesticideCost) || 0,
        transport_cost: parseFloat(formData.transportCost) || 0,
        other_costs: parseFloat(formData.otherCosts) || 0,
        total_investment: best.totalInvestment,
        market_price_per_unit: cropData[best.crop].marketPrice,
        expected_income: best.expectedIncome,
        net_profit: best.netProfit,
        profit_margin: best.profitMargin,
      });

      if (error) throw error;

      toast({
        title: t('profit.analysisComplete'),
        description: `${t('profit.bestCrop')}: ${best.crop.charAt(0).toUpperCase() + best.crop.slice(1)}`,
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('profit.analysisError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = estimations.map(est => ({
    name: est.crop.charAt(0).toUpperCase() + est.crop.slice(1),
    profit: est.netProfit,
    investment: est.totalInvestment,
    income: est.expectedIncome,
  }));

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground">{t('profit.title')}</h1>
                <p className="text-xs text-muted-foreground">{t('profit.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Crop Selection */}
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                {t('profit.selectCrops')}
              </CardTitle>
              <CardDescription>{t('profit.selectCropsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Object.keys(cropData).map((crop) => (
                  <button
                    type="button"
                    key={crop}
                    onClick={() => toggleCropSelection(crop)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedCrops.includes(crop)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Leaf className={`w-5 h-5 mx-auto mb-1 ${selectedCrops.includes(crop) ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium capitalize">{crop}</span>
                    <p className="text-xs text-muted-foreground">₹{cropData[crop].marketPrice}/kg</p>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {t('profit.selected')}: {selectedCrops.length}/5
              </p>
            </CardContent>
          </Card>

          {/* Step 2: Land Area */}
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                {t('profit.landDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="landArea">{t('profit.landArea')}</Label>
                <Input
                  id="landArea"
                  type="number"
                  step="0.1"
                  placeholder={t('profit.landAreaPlaceholder')}
                  value={formData.landArea}
                  onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Costs */}
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                {t('profit.cultivationCosts')}
              </CardTitle>
              <CardDescription>{t('profit.cultivationCostsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fertilizerCost">{t('profit.fertilizerCost')}</Label>
                  <Input
                    id="fertilizerCost"
                    type="number"
                    placeholder="₹"
                    value={formData.fertilizerCost}
                    onChange={(e) => setFormData({ ...formData, fertilizerCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterCost">{t('profit.waterCost')}</Label>
                  <Input
                    id="waterCost"
                    type="number"
                    placeholder="₹"
                    value={formData.waterCost}
                    onChange={(e) => setFormData({ ...formData, waterCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="laborCost">{t('profit.laborCost')}</Label>
                  <Input
                    id="laborCost"
                    type="number"
                    placeholder="₹"
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seedCost">{t('profit.seedCost')}</Label>
                  <Input
                    id="seedCost"
                    type="number"
                    placeholder="₹"
                    value={formData.seedCost}
                    onChange={(e) => setFormData({ ...formData, seedCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pesticideCost">{t('profit.pesticideCost')}</Label>
                  <Input
                    id="pesticideCost"
                    type="number"
                    placeholder="₹"
                    value={formData.pesticideCost}
                    onChange={(e) => setFormData({ ...formData, pesticideCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportCost">{t('profit.transportCost')}</Label>
                  <Input
                    id="transportCost"
                    type="number"
                    placeholder="₹"
                    value={formData.transportCost}
                    onChange={(e) => setFormData({ ...formData, transportCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="otherCosts">{t('profit.otherCosts')}</Label>
                  <Input
                    id="otherCosts"
                    type="number"
                    placeholder="₹"
                    value={formData.otherCosts}
                    onChange={(e) => setFormData({ ...formData, otherCosts: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading || selectedCrops.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('profit.calculating')}
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                {t('profit.calculateProfit')}
              </>
            )}
          </Button>
        </form>

        {/* Results */}
        {estimations.length > 0 && (
          <div className="mt-8 space-y-6 animate-scale-in">
            {/* Best Crop Card */}
            <Card className="shadow-card border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-2xl">{t('profit.bestCropRecommendation')}</CardTitle>
                    <CardDescription>{t('profit.basedOnAnalysis')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground mb-1">{t('profit.bestCrop')}</p>
                    <p className="text-2xl font-bold capitalize">{estimations[0].crop}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground mb-1">{t('profit.expectedYield')}</p>
                    <p className="text-2xl font-bold">{estimations[0].totalYield.toLocaleString()} kg</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground mb-1">{t('profit.netProfit')}</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(estimations[0].netProfit)}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground mb-1">{t('profit.profitMargin')}</p>
                    <p className="text-2xl font-bold">{estimations[0].profitMargin.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
                  {estimations[0].riskLevel === 'Low' ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : estimations[0].riskLevel === 'High' ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-agri-gold" />
                  )}
                  <span className="text-sm">
                    {t('profit.riskLevel')}: <strong className={
                      estimations[0].riskLevel === 'Low' ? 'text-primary' : 
                      estimations[0].riskLevel === 'High' ? 'text-destructive' : 'text-agri-gold'
                    }>{t(`profit.risk${estimations[0].riskLevel}`)}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-serif text-xl">{t('profit.profitComparison')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="profit" name={t('profit.netProfit')} radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* All Crops Comparison Table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-serif text-xl">{t('profit.detailedBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">{t('profit.crop')}</th>
                        <th className="text-right py-3 px-2 font-medium">{t('profit.yield')}</th>
                        <th className="text-right py-3 px-2 font-medium">{t('profit.investment')}</th>
                        <th className="text-right py-3 px-2 font-medium">{t('profit.income')}</th>
                        <th className="text-right py-3 px-2 font-medium">{t('profit.profit')}</th>
                        <th className="text-center py-3 px-2 font-medium">{t('profit.risk')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimations.map((est, index) => (
                        <tr key={est.crop} className={`border-b ${index === 0 ? 'bg-primary/5' : ''}`}>
                          <td className="py-3 px-2 capitalize font-medium">
                            {index === 0 && <span className="mr-2">🏆</span>}
                            {est.crop}
                          </td>
                          <td className="text-right py-3 px-2">{est.totalYield.toLocaleString()} kg</td>
                          <td className="text-right py-3 px-2">{formatCurrency(est.totalInvestment)}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(est.expectedIncome)}</td>
                          <td className="text-right py-3 px-2 font-medium text-primary">{formatCurrency(est.netProfit)}</td>
                          <td className="text-center py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              est.riskLevel === 'Low' ? 'bg-primary/10 text-primary' :
                              est.riskLevel === 'High' ? 'bg-destructive/10 text-destructive' :
                              'bg-agri-gold/20 text-agri-earth'
                            }`}>
                              {t(`profit.risk${est.riskLevel}`)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
