-- Restrict lands SELECT to authenticated users to avoid exposing owner_id publicly
DROP POLICY IF EXISTS "Anyone can view available lands" ON public.lands;
CREATE POLICY "Authenticated users can view available lands"
ON public.lands
FOR SELECT
TO authenticated
USING (is_available = true);

-- Allow buyers and sellers to delete their own inquiries
CREATE POLICY "Buyers can delete their own inquiries"
ON public.buyer_inquiries
FOR DELETE
TO authenticated
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can delete their inquiries"
ON public.buyer_inquiries
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);