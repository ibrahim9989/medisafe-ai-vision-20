
-- Create a table for tracking token usage
CREATE TABLE public.token_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  feature_type TEXT NOT NULL, -- 'prescription' or 'interpret_ai'
  counter_type TEXT NOT NULL, -- 'gpt41', 'stt', 'lyzr'
  tokens_used INTEGER NOT NULL DEFAULT 0,
  prescription_id UUID REFERENCES prescriptions(id) NULL, -- Only for prescription features
  session_id TEXT NULL, -- For grouping related operations
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own token usage
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for token usage
CREATE POLICY "Users can view their own token usage" 
  ON public.token_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own token usage" 
  ON public.token_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own token usage" 
  ON public.token_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_token_usage_user_feature ON public.token_usage(user_id, feature_type);
CREATE INDEX idx_token_usage_prescription ON public.token_usage(prescription_id);
CREATE INDEX idx_token_usage_created_at ON public.token_usage(created_at);

-- Add trigger to update updated_at column
CREATE TRIGGER update_token_usage_updated_at
  BEFORE UPDATE ON public.token_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
