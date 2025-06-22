
-- Add underlying_conditions and diagnosis fields to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS underlying_conditions text,
ADD COLUMN IF NOT EXISTS diagnosis_details text;

-- Update the consultation_transcripts table to include underlying_conditions if not exists
ALTER TABLE public.consultation_transcripts 
ADD COLUMN IF NOT EXISTS underlying_conditions text;
