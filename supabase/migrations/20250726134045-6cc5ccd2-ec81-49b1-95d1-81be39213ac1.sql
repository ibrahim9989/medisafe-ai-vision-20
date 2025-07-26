-- Update token_usage table for RadioGPT
-- Since enums don't exist, we'll just update any existing interpret_ai records to radiogpt
UPDATE public.token_usage 
SET feature_type = 'radiogpt' 
WHERE feature_type = 'interpret_ai';

-- Create index for better performance on RadioGPT queries
CREATE INDEX IF NOT EXISTS idx_token_usage_radiogpt 
ON public.token_usage (user_id, feature_type) 
WHERE feature_type = 'radiogpt';

-- Update audit logs to track RadioGPT migration
INSERT INTO public.audit_logs (user_id, action, resource, metadata)
SELECT 
    '00000000-0000-0000-0000-000000000000', -- System user
    'system_migration',
    'token_usage_radiogpt',
    jsonb_build_object(
        'migration', 'interpret_ai_to_radiogpt',
        'timestamp', now(),
        'description', 'Successfully migrated interpret_ai feature to radiogpt with enhanced token tracking'
    )
WHERE NOT EXISTS (
    SELECT 1 FROM public.audit_logs 
    WHERE action = 'system_migration' 
    AND resource = 'token_usage_radiogpt'
    AND metadata->>'migration' = 'interpret_ai_to_radiogpt'
);