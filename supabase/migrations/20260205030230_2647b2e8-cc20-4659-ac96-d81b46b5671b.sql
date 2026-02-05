-- Allow sellers to delete their orders (for delivered orders cleanup)
CREATE POLICY "Sellers can delete completed orders" 
ON public.orders 
FOR DELETE 
USING (auth.uid() = seller_id);