import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ShoppingBag, 
  CheckCircle, 
  Package, 
  MapPin, 
  Phone, 
  User, 
  Mail,
  ArrowLeft,
  Truck,
  Clock,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Order {
  id: string;
  buyer_id: string;
  listing_id: string;
  quantity: number;
  unit: string;
  total_amount: number;
  status: string;
  payment_status: string;
  delivery_address: string | null;
  created_at: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_email?: string;
  buyer_address?: string;
  crop_name?: string;
}

export default function Orders() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const enrichedOrders = await Promise.all(
        data.map(async (order) => {
          const { data: buyerData } = await supabase
            .from('profiles')
            .select('full_name, phone, email, address')
            .eq('id', order.buyer_id)
            .single();

          const { data: listingData } = await supabase
            .from('marketplace_listings')
            .select('crop_name')
            .eq('id', order.listing_id)
            .single();

          return {
            ...order,
            buyer_name: buyerData?.full_name || 'Unknown Buyer',
            buyer_phone: buyerData?.phone || null,
            buyer_email: buyerData?.email || '',
            buyer_address: buyerData?.address || null,
            crop_name: listingData?.crop_name || 'Unknown Product',
          };
        })
      );
      setOrders(enrichedOrders);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (status === 'delivered') {
      // Delete the order once delivered
      await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      setOrders(prev => prev.filter(order => order.id !== orderId));
    } else {
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    }
    setDetailsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <ShoppingBag className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

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
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-foreground">
                  {t('farmer.orders') || 'Orders'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('farmer.manageOrders') || 'Manage your customer orders'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">{t('farmer.pending') || 'Pending'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
                <p className="text-xs text-muted-foreground">{t('farmer.confirmed') || 'Confirmed'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{shippedCount}</p>
                <p className="text-xs text-muted-foreground">{t('farmer.shipped') || 'Shipped'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                <p className="text-xs text-muted-foreground">{t('farmer.totalOrders') || 'Total'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">{t('farmer.pending') || 'Pending'}</span>
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('farmer.confirmed') || 'Confirmed'}</span>
            </TabsTrigger>
            <TabsTrigger value="shipped" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">{t('farmer.shipped') || 'Shipped'}</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t('farmer.all') || 'All'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {t('farmer.noOrders') || 'No orders found'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card 
                    key={order.id}
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                      order.status === 'pending' ? 'border-amber-500/30 bg-amber-500/5' : ''
                    }`}
                    onClick={() => openDetails(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground capitalize text-lg">
                              {order.crop_name}
                            </h3>
                            <Badge variant="outline" className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {order.buyer_name}
                            </span>
                            <span>•</span>
                            <span>{order.quantity} {order.unit}</span>
                            <span>•</span>
                            <span className="font-medium text-primary">₹{order.total_amount.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t('farmer.orderDetails') || 'Order Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="p-4 bg-muted rounded-xl">
                <h3 className="font-semibold capitalize text-lg">{selectedOrder.crop_name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{selectedOrder.quantity} {selectedOrder.unit}</span>
                  <span>•</span>
                  <span className="font-semibold text-primary">₹{selectedOrder.total_amount.toLocaleString()}</span>
                </div>
                <Badge variant="outline" className={`mt-2 ${getStatusColor(selectedOrder.status)} flex items-center gap-1 w-fit`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </Badge>
              </div>

              {/* Buyer Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">{t('farmer.buyerDetails') || 'Buyer Details'}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedOrder.buyer_name}</span>
                  </div>
                  {selectedOrder.buyer_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedOrder.buyer_phone}`} className="text-primary hover:underline">
                        {selectedOrder.buyer_phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedOrder.buyer_email}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{t('farmer.deliveryAddress') || 'Delivery Address'}</h4>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">
                    {selectedOrder.delivery_address || selectedOrder.buyer_address || t('farmer.noAddress') || 'No address provided'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('farmer.cancelOrder') || 'Cancel'}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('farmer.confirmOrder') || 'Confirm Order'}
                  </Button>
                </div>
              )}
              {selectedOrder.status === 'confirmed' && (
                <Button
                  className="w-full"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  {t('farmer.markShipped') || 'Mark as Shipped'}
                </Button>
              )}
              {selectedOrder.status === 'shipped' && (
                <Button
                  className="w-full"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  {t('farmer.markDelivered') || 'Mark as Delivered'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
