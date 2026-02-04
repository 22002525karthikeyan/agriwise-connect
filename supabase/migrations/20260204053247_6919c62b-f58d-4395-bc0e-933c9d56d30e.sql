-- Create profit_estimations table
CREATE TABLE public.profit_estimations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crop_name TEXT NOT NULL,
  land_area NUMERIC NOT NULL,
  expected_yield_per_acre NUMERIC NOT NULL,
  total_yield NUMERIC NOT NULL,
  fertilizer_cost NUMERIC NOT NULL DEFAULT 0,
  water_cost NUMERIC NOT NULL DEFAULT 0,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  seed_cost NUMERIC NOT NULL DEFAULT 0,
  pesticide_cost NUMERIC NOT NULL DEFAULT 0,
  transport_cost NUMERIC NOT NULL DEFAULT 0,
  other_costs NUMERIC NOT NULL DEFAULT 0,
  total_investment NUMERIC NOT NULL,
  market_price_per_unit NUMERIC NOT NULL,
  expected_income NUMERIC NOT NULL,
  net_profit NUMERIC NOT NULL,
  profit_margin NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profit_estimations ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage their profit estimations" 
ON public.profit_estimations 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);