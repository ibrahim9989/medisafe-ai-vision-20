
-- Create table for AI interpretations
CREATE TABLE public.ai_interpretations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  doctor_id UUID REFERENCES public.doctor_profiles(id),
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL, -- 'radiological', 'ecg', 'eeg', 'other'
  interpretation TEXT NOT NULL,
  patient_name TEXT,
  patient_age INTEGER,
  clinical_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_interpretations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own interpretations" 
  ON public.ai_interpretations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interpretations" 
  ON public.ai_interpretations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interpretations" 
  ON public.ai_interpretations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interpretations" 
  ON public.ai_interpretations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for medical images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-images', 'medical-images', true);

-- Create storage policies
CREATE POLICY "Users can upload medical images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'medical-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view medical images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'medical-images');

CREATE POLICY "Users can update their medical images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'medical-images' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete their medical images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'medical-images' AND auth.uid()::text = owner);
