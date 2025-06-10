
-- Create a table for doctor profiles
CREATE TABLE public.doctor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  country TEXT,
  profile_picture_url TEXT,
  phone_number TEXT,
  years_of_experience INTEGER,
  specialization TEXT[],
  clinical_address TEXT,
  pincode TEXT,
  regulatory_body TEXT,
  license_number TEXT,
  is_profile_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for doctor profiles
CREATE POLICY "Users can view their own profile" 
  ON public.doctor_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
  ON public.doctor_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.doctor_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create patient table for patient history management
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL UNIQUE,
  doctor_id UUID REFERENCES public.doctor_profiles(id) NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own patients" 
  ON public.patients 
  FOR SELECT 
  USING (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can create patients" 
  ON public.patients 
  FOR INSERT 
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update their own patients" 
  ON public.patients 
  FOR UPDATE 
  USING (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

-- Create patient visits table for visit history
CREATE TABLE public.patient_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  doctor_id UUID REFERENCES public.doctor_profiles(id) NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason_for_visit TEXT,
  diagnosis TEXT,
  prescription_id UUID REFERENCES public.prescriptions(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for patient visits
ALTER TABLE public.patient_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own patient visits" 
  ON public.patient_visits 
  FOR SELECT 
  USING (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can create patient visits" 
  ON public.patient_visits 
  FOR INSERT 
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update their own patient visits" 
  ON public.patient_visits 
  FOR UPDATE 
  USING (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

-- Create triggers for updated_at columns
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_visits_updated_at
  BEFORE UPDATE ON public.patient_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate unique patient ID
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate a patient ID in format: PAT-YYYYMMDD-XXXX
    new_id := 'PAT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if this ID already exists
    SELECT COUNT(*) INTO exists_check FROM public.patients WHERE patient_id = new_id;
    
    -- If it doesn't exist, we can use it
    IF exists_check = 0 THEN
      RETURN new_id;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger to auto-generate patient_id
CREATE OR REPLACE FUNCTION public.set_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.patient_id IS NULL OR NEW.patient_id = '' THEN
    NEW.patient_id := public.generate_patient_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_patient_id_trigger
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_patient_id();
