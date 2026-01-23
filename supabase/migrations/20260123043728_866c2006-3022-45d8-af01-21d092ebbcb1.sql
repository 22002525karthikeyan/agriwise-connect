-- Add new columns to profiles table for enhanced user details
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Add delivery_address to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Allow sellers (farmers) to view buyer profile details for their orders
CREATE POLICY "Sellers can view buyer profiles for their orders"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.seller_id = auth.uid()
    AND orders.buyer_id = profiles.id
  )
);

-- Allow landowners to view buyer profiles for their inquiries
CREATE POLICY "Landowners can view buyer profiles for their inquiries"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.buyer_inquiries
    WHERE buyer_inquiries.seller_id = auth.uid()
    AND buyer_inquiries.buyer_id = profiles.id
  )
);