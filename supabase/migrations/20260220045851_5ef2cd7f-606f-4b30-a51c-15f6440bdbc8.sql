
-- Create agri_inputs table for seeds, fertilizers, and agricultural products
CREATE TABLE public.agri_inputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'seeds', -- seeds, fertilizers, pesticides, tools, other
  description TEXT,
  price_per_unit NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  quantity_available NUMERIC NOT NULL DEFAULT 0,
  brand TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agri_inputs ENABLE ROW LEVEL SECURITY;

-- Anyone can view available listings
CREATE POLICY "Anyone can view available agri inputs"
ON public.agri_inputs
FOR SELECT
USING (is_available = true);

-- Sellers can manage their own listings
CREATE POLICY "Sellers can manage their agri inputs"
ON public.agri_inputs
FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Create agri_input_orders table
CREATE TABLE public.agri_input_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  input_id UUID NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agri_input_orders ENABLE ROW LEVEL SECURITY;

-- Buyers can create and view their orders
CREATE POLICY "Buyers can create agri input orders"
ON public.agri_input_orders
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can view their agri input orders"
ON public.agri_input_orders
FOR SELECT
USING (auth.uid() = buyer_id);

-- Sellers can view and update orders for their products
CREATE POLICY "Sellers can view their agri input orders"
ON public.agri_input_orders
FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can update agri input order status"
ON public.agri_input_orders
FOR UPDATE
USING (auth.uid() = seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_agri_inputs_updated_at
BEFORE UPDATE ON public.agri_inputs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agri_input_orders_updated_at
BEFORE UPDATE ON public.agri_input_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
