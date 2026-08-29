import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, ShoppingBag, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DeleteButton } from '@/components/common/DeleteButton';

interface MyOrder {
  id: string;
  listing_id: string;
  quantity: number;
  unit: string;
  total_amount: number;
  status: string;
  delivery_address: string | null;
  created_at: string;
  crop_name?: string;
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const enriched = await Promise.all(
        data.map(async (order) => {
          const { data: listing } = await supabase
            .from('marketplace_listings')
            .select('crop_name')
            .eq('id', order.listing_id)
            .maybeSingle();

          return { ...order, crop_name: listing?.crop_name || 'Product' };
        })
      );
      setOrders(enriched);
    }
    setLoading(false);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove order',
        variant: 'destructive',
      });
      return;
    }

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    toast({ title: 'Removed', description: 'Order deleted from your history' });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">My Orders</h1>
              <p className="text-sm text-muted-foreground">Track and manage your purchases</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <p className="text-center py-12 text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold text-foreground mb-1">No orders yet</h3>
              <p className="text-muted-foreground">Browse the marketplace to place your first order.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold capitalize text-lg text-foreground">{order.crop_name}</h3>
                      <Badge variant="outline" className={statusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{order.quantity} {order.unit}</span>
                      <span>•</span>
                      <span className="font-medium text-primary">₹{order.total_amount.toLocaleString()}</span>
                      <span>•</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    {order.delivery_address && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5" />
                        {order.delivery_address}
                      </p>
                    )}
                  </div>
                  <DeleteButton
                    label="Remove"
                    title="Remove this order?"
                    description="This order will be permanently deleted from your history."
                    onConfirm={() => handleDeleteOrder(order.id)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
