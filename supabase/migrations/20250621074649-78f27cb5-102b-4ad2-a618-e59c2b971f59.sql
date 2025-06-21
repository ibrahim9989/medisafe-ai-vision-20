
-- Add new fields to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN consultation_notes TEXT,
ADD COLUMN recommended_tests JSONB DEFAULT '[]'::jsonb,
ADD COLUMN lab_reports JSONB DEFAULT '[]'::jsonb,
ADD COLUMN lab_analysis TEXT;

-- Create follow_up_prescriptions table to track prescription relationships
CREATE TABLE public.follow_up_prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_prescription_id UUID REFERENCES public.prescriptions(id) NOT NULL,
  follow_up_prescription_id UUID REFERENCES public.prescriptions(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(original_prescription_id, follow_up_prescription_id)
);

-- Add RLS policies for follow_up_prescriptions
ALTER TABLE public.follow_up_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their follow-up prescriptions" 
  ON public.follow_up_prescriptions 
  FOR SELECT 
  USING (
    original_prescription_id IN (
      SELECT id FROM public.prescriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create follow-up prescriptions" 
  ON public.follow_up_prescriptions 
  FOR INSERT 
  WITH CHECK (
    original_prescription_id IN (
      SELECT id FROM public.prescriptions WHERE user_id = auth.uid()
    )
  );

-- Update patient_visits table to include new fields
ALTER TABLE public.patient_visits 
ADD COLUMN consultation_notes TEXT,
ADD COLUMN recommended_tests JSONB DEFAULT '[]'::jsonb,
ADD COLUMN lab_reports JSONB DEFAULT '[]'::jsonb,
ADD COLUMN is_follow_up BOOLEAN DEFAULT false,
ADD COLUMN original_visit_id UUID REFERENCES public.patient_visits(id);

-- Add trigger for updated_at on follow_up_prescriptions
CREATE TRIGGER update_follow_up_prescriptions_updated_at
  BEFORE UPDATE ON public.follow_up_prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update consultation_transcripts to include lab analysis
ALTER TABLE public.consultation_transcripts 
ADD COLUMN lab_analysis TEXT,
ADD COLUMN recommended_tests JSONB DEFAULT '[]'::jsonb;
