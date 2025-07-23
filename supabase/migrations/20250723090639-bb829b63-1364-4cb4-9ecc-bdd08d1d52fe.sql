-- Fix security warnings - set search_path for all functions

-- Fix function search paths to prevent SQL injection vulnerabilities
ALTER FUNCTION public.generate_patient_id() SET search_path TO '';
ALTER FUNCTION public.set_patient_id() SET search_path TO '';
ALTER FUNCTION public.insert_ai_interpretation(uuid, text, text, text, text, integer, text) SET search_path TO '';
ALTER FUNCTION public.handle_new_user() SET search_path TO '';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO '';
ALTER FUNCTION public.log_data_access() SET search_path TO '';
ALTER FUNCTION public.expire_access_permissions() SET search_path TO '';
ALTER FUNCTION public.generate_compliance_report(text, date, date) SET search_path TO '';