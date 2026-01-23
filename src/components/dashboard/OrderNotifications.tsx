import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingBag, CheckCircle, Package, MapPin, Phone, User, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export function OrderNotifications() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
      // Fetch buyer details and listing info for each order
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
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    setDetailsOpen(false);
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

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

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  if (loading) {
    return null;
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            {t('farmer.orders') || 'Orders'}
            {pendingCount > 0 && (
              <Badge variant="default" className="ml-2">
                {pendingCount} {t('farmer.newOrders') || 'new'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className={`p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                order.status === 'pending' ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
              }`}
              onClick={() => openDetails(order)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground capitalize">
                      {order.crop_name}
                    </p>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.buyer_name} • {order.quantity} {order.unit} • ₹{order.total_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
                <Badge variant="outline" className={`mt-2 ${getStatusColor(selectedOrder.status)}`}>
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
                  {t('farmer.markShipped') || 'Mark as Shipped'}
                </Button>
              )}
              {selectedOrder.status === 'shipped' && (
                <Button
                  className="w-full"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                >
                  {t('farmer.markDelivered') || 'Mark as Delivered'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
