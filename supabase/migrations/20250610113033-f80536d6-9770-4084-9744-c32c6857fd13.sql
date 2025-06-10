
-- Add public_profile field to doctor_profiles table to allow doctors to opt-in/out of directory
ALTER TABLE public.doctor_profiles 
ADD COLUMN public_profile BOOLEAN NOT NULL DEFAULT false;

-- Create RLS policy to allow public reading of directory data for doctors who opt-in
CREATE POLICY "Public can view public doctor profiles" 
  ON public.doctor_profiles 
  FOR SELECT 
  TO anon, authenticated
  USING (public_profile = true);

-- Update the updated_at trigger to handle the new column
COMMENT ON COLUMN public.doctor_profiles.public_profile IS 'Allows doctor to show their profile in public directory';
