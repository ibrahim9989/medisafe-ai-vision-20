
-- Create RPC function to insert AI interpretations
CREATE OR REPLACE FUNCTION public.insert_ai_interpretation(
  p_user_id UUID,
  p_image_url TEXT,
  p_image_type TEXT,
  p_interpretation TEXT,
  p_patient_name TEXT DEFAULT NULL,
  p_patient_age INTEGER DEFAULT NULL,
  p_clinical_context TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.ai_interpretations (
    user_id,
    image_url,
    image_type,
    interpretation,
    patient_name,
    patient_age,
    clinical_context
  ) VALUES (
    p_user_id,
    p_image_url,
    p_image_type,
    p_interpretation,
    p_patient_name,
    p_patient_age,
    p_clinical_context
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;
