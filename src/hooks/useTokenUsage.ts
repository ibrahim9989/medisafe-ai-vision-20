
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface TokenUsage {
  id: string;
  user_id: string;
  feature_type: 'prescription' | 'interpret_ai';
  counter_type: 'gpt41' | 'stt' | 'lyzr';
  tokens_used: number;
  prescription_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export const useTokenUsage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const logTokenUsage = async ({
    feature_type,
    counter_type,
    tokens_used,
    prescription_id,
    session_id
  }: {
    feature_type: 'prescription' | 'interpret_ai';
    counter_type: 'gpt41' | 'stt' | 'lyzr';
    tokens_used: number;
    prescription_id?: string;
    session_id?: string;
  }) => {
    if (!user) {
      console.error('User not authenticated for token logging');
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('token_usage')
        .insert({
          user_id: user.id,
          feature_type,
          counter_type,
          tokens_used,
          prescription_id: prescription_id || null,
          session_id: session_id || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging token usage:', error);
        throw error;
      }

      console.log(`✅ Token usage logged: ${counter_type} - ${tokens_used} tokens for ${feature_type}`);
      return data;
    } catch (error) {
      console.error('Failed to log token usage:', error);
      toast({
        title: "Token Logging Error",
        description: "Failed to log token usage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenUsage = async (feature_type?: 'prescription' | 'interpret_ai') => {
    if (!user) return [];

    try {
      let query = supabase
        .from('token_usage')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (feature_type) {
        query = query.eq('feature_type', feature_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching token usage:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch token usage:', error);
      return [];
    }
  };

  const getTotalTokens = async (feature_type?: 'prescription' | 'interpret_ai', counter_type?: 'gpt41' | 'stt' | 'lyzr') => {
    if (!user) return 0;

    try {
      let query = supabase
        .from('token_usage')
        .select('tokens_used')
        .eq('user_id', user.id);

      if (feature_type) {
        query = query.eq('feature_type', feature_type);
      }

      if (counter_type) {
        query = query.eq('counter_type', counter_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching total tokens:', error);
        throw error;
      }

      return data?.reduce((total, usage) => total + usage.tokens_used, 0) || 0;
    } catch (error) {
      console.error('Failed to fetch total tokens:', error);
      return 0;
    }
  };

  return {
    logTokenUsage,
    getTokenUsage,
    getTotalTokens,
    isLoading
  };
};
