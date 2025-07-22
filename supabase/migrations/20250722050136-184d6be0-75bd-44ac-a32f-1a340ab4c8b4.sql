-- Create FHIR data tables for storing synchronized patient data

-- FHIR Observations (vital signs, lab results)
CREATE TABLE public.fhir_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  fhir_id TEXT NOT NULL UNIQUE,
  code TEXT,
  display TEXT,
  value_quantity DECIMAL,
  value_unit TEXT,
  value_string TEXT,
  effective_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FHIR Medications
CREATE TABLE public.fhir_medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  fhir_id TEXT NOT NULL UNIQUE,
  medication_code TEXT,
  medication_display TEXT,
  status TEXT,
  effective_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FHIR Allergies
CREATE TABLE public.fhir_allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  fhir_id TEXT NOT NULL UNIQUE,
  allergen_code TEXT,
  allergen_display TEXT,
  clinical_status TEXT,
  verification_status TEXT,
  reaction TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FHIR Conditions
CREATE TABLE public.fhir_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  fhir_id TEXT NOT NULL UNIQUE,
  condition_code TEXT,
  condition_display TEXT,
  clinical_status TEXT,
  verification_status TEXT,
  onset_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add FHIR ID column to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS fhir_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Enable Row Level Security
ALTER TABLE public.fhir_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fhir_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fhir_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fhir_conditions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for FHIR tables
-- Observations policies
CREATE POLICY "Doctors can view their patients' FHIR observations" 
ON public.fhir_observations 
FOR SELECT 
USING (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Doctors can insert their patients' FHIR observations" 
ON public.fhir_observations 
FOR INSERT 
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Doctors can update their patients' FHIR observations" 
ON public.fhir_observations 
FOR UPDATE 
USING (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Medications policies
CREATE POLICY "Doctors can view their patients' FHIR medications" 
ON public.fhir_medications 
FOR SELECT 
USING (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Doctors can insert their patients' FHIR medications" 
ON public.fhir_medications 
FOR INSERT 
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Doctors can update their patients' FHIR medications" 
ON public.fhir_medications 
FOR UPDATE 
USING (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Allergies policies
CREATE POLICY "Doctors can view their patients' FHIR allergies" 
ON public.fhir_allergies 
FOR SELECT 
USING (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Doctors can insert their patients' FHIR allergies" 
ON public.fhir_allergies 
FOR INSERT 
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Doctors can update their patients' FHIR allergies" 
ON public.fhir_allergies 
FOR UPDATE 
USING (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Conditions policies
CREATE POLICY "Doctors can view their patients' FHIR conditions" 
ON public.fhir_conditions 
FOR SELECT 
USING (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Doctors can insert their patients' FHIR conditions" 
ON public.fhir_conditions 
FOR INSERT 
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Doctors can update their patients' FHIR conditions" 
ON public.fhir_conditions 
FOR UPDATE 
USING (
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE doctor_id IN (
      SELECT id FROM public.doctor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create indexes for better performance
CREATE INDEX idx_fhir_observations_patient_id ON public.fhir_observations(patient_id);
CREATE INDEX idx_fhir_observations_fhir_id ON public.fhir_observations(fhir_id);
CREATE INDEX idx_fhir_medications_patient_id ON public.fhir_medications(patient_id);
CREATE INDEX idx_fhir_medications_fhir_id ON public.fhir_medications(fhir_id);
CREATE INDEX idx_fhir_allergies_patient_id ON public.fhir_allergies(patient_id);
CREATE INDEX idx_fhir_allergies_fhir_id ON public.fhir_allergies(fhir_id);
CREATE INDEX idx_fhir_conditions_patient_id ON public.fhir_conditions(patient_id);
CREATE INDEX idx_fhir_conditions_fhir_id ON public.fhir_conditions(fhir_id);
CREATE INDEX idx_patients_fhir_id ON public.patients(fhir_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_fhir_observations_updated_at
  BEFORE UPDATE ON public.fhir_observations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fhir_medications_updated_at
  BEFORE UPDATE ON public.fhir_medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fhir_allergies_updated_at
  BEFORE UPDATE ON public.fhir_allergies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fhir_conditions_updated_at
  BEFORE UPDATE ON public.fhir_conditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();