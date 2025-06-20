
-- Create table for storing consultation transcripts and AI analysis
CREATE TABLE public.consultation_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  doctor_id UUID REFERENCES public.doctor_profiles(id),
  transcript TEXT NOT NULL,
  analysis_data JSONB,
  summary TEXT,
  chief_complaint TEXT,
  diagnosis TEXT,
  action_items JSONB DEFAULT '{"doctor": [], "patient": []}'::jsonb,
  follow_up_instructions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.consultation_transcripts ENABLE ROW LEVEL SECURITY;

-- Policy for doctors to view their own consultation transcripts
CREATE POLICY "Doctors can view their consultation transcripts" 
  ON public.consultation_transcripts 
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for doctors to insert their own consultation transcripts
CREATE POLICY "Doctors can create consultation transcripts" 
  ON public.consultation_transcripts 
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for doctors to update their own consultation transcripts
CREATE POLICY "Doctors can update their consultation transcripts" 
  ON public.consultation_transcripts 
  FOR UPDATE 
  USING (
    doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_consultation_transcripts_updated_at
  BEFORE UPDATE ON public.consultation_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
