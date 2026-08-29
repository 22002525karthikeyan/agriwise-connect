CREATE POLICY "Buyers can view seller profiles for their inquiries"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM buyer_inquiries
    WHERE buyer_inquiries.buyer_id = auth.uid()
      AND buyer_inquiries.seller_id = profiles.id
  )
);