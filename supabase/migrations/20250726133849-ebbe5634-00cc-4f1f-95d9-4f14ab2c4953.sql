-- Update token_usage table to support RadioGPT
-- Add new feature and counter types
ALTER TYPE feature_type ADD VALUE IF NOT EXISTS 'radiogpt';

-- Update counter_type enum to include AI providers
DO $$ 
BEGIN
    -- Check if the enum values exist before adding them
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'gemini' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'counter_type')) THEN
        ALTER TYPE counter_type ADD VALUE 'gemini';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'azure_openai' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'counter_type')) THEN
        ALTER TYPE counter_type ADD VALUE 'azure_openai';
    END IF;
END $$;

-- Update existing 'interpret_ai' records to 'radiogpt' if any exist
UPDATE public.token_usage 
SET feature_type = 'radiogpt' 
WHERE feature_type = 'interpret_ai';

-- Create index for better performance on RadioGPT queries
CREATE INDEX IF NOT EXISTS idx_token_usage_radiogpt 
ON public.token_usage (user_id, feature_type) 
WHERE feature_type = 'radiogpt';

-- Update audit logs to track RadioGPT usage
INSERT INTO public.audit_logs (user_id, action, resource, metadata)
SELECT 
    '00000000-0000-0000-0000-000000000000', -- System user
    'system_migration',
    'token_usage_schema',
    jsonb_build_object(
        'migration', 'interpret_ai_to_radiogpt',
        'timestamp', now(),
        'description', 'Migrated interpret_ai feature to radiogpt with enhanced token tracking'
    )
WHERE NOT EXISTS (
    SELECT 1 FROM public.audit_logs 
    WHERE action = 'system_migration' 
    AND resource = 'token_usage_schema'
    AND metadata->>'migration' = 'interpret_ai_to_radiogpt'
);