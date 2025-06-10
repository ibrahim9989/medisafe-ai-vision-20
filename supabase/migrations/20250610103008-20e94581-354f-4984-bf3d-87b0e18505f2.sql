
-- Add diagnosis column to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN diagnosis text;
