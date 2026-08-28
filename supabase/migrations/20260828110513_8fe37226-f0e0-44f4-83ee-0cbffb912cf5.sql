CREATE POLICY "Buyers can delete their own orders"
ON public.orders
FOR DELETE
TO authenticated
USING (auth.uid() = buyer_id);