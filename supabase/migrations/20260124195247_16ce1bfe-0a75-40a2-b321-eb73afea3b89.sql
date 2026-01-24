-- Add geolocation fields to lands table
ALTER TABLE public.lands 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);