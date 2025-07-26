import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RadioGPTTokenUsage {
  id: string;
  user_id: string;
  feature_type: 'radiogpt';
  counter_type: 'gemini' | 'azure_openai';
  tokens_used: number;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export const useRadioGPTTokens = () => {
  const [tokenUsage, setTokenUsage] = useState<RadioGPTTokenUsage[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const logTokenUsage = async (data: {
    counter_type: 'gemini' | 'azure_openai';
    tokens_used: number;
    session_id?: string;
  }): Promise<RadioGPTTokenUsage | undefined> => {
    if (!user) {
      console.error('RadioGPT: Cannot log token usage - user not authenticated');
      return;
    }

    try {
      console.log('RadioGPT: Logging token usage', { 
        userId: user.id, 
        tokens: data.tokens_used, 
        provider: data.counter_type 
      });

      const { data: result, error } = await supabase
        .from('token_usage')
        .insert({
          user_id: user.id,
          feature_type: 'radiogpt',
          counter_type: data.counter_type,
          tokens_used: data.tokens_used,
          session_id: data.session_id
        })
        .select()
        .single();

      if (error) {
        console.error('RadioGPT: Error logging token usage', error);
        throw error;
      }

      console.log('RadioGPT: Token usage logged successfully', result);
      
      // Refresh token usage data
      await getTokenUsage();
      
      return result;
    } catch (error) {
      console.error('RadioGPT: Failed to log token usage', error);
      throw error;
    }
  };

  const getTokenUsage = async (): Promise<RadioGPTTokenUsage[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      console.log('RadioGPT: Fetching token usage for user', user.id);

      const { data, error } = await supabase
        .from('token_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_type', 'radiogpt')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('RadioGPT: Error fetching token usage', error);
        throw error;
      }

      console.log('RadioGPT: Token usage fetched', { count: data?.length || 0 });
      
      setTokenUsage(data || []);
      return data || [];
    } catch (error) {
      console.error('RadioGPT: Failed to fetch token usage', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTotalTokens = async (counter_type?: 'gemini' | 'azure_openai'): Promise<number> => {
    if (!user) return 0;

    try {
      console.log('RadioGPT: Calculating total tokens', { userId: user.id, counterType: counter_type });

      let query = supabase
        .from('token_usage')
        .select('tokens_used')
        .eq('user_id', user.id)
        .eq('feature_type', 'radiogpt');

      if (counter_type) {
        query = query.eq('counter_type', counter_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('RadioGPT: Error calculating total tokens', error);
        throw error;
      }

      const total = data?.reduce((sum, record) => sum + record.tokens_used, 0) || 0;
      console.log('RadioGPT: Total tokens calculated', { total, records: data?.length || 0 });
      
      setTotalTokens(total);
      return total;
    } catch (error) {
      console.error('RadioGPT: Failed to calculate total tokens', error);
      return 0;
    }
  };

  // Load token usage when user changes
  useEffect(() => {
    if (user) {
      getTokenUsage();
      getTotalTokens();
    } else {
      setTokenUsage([]);
      setTotalTokens(0);
    }
  }, [user]);

  return {
    tokenUsage,
    totalTokens,
    loading,
    logTokenUsage,
    getTokenUsage,
    getTotalTokens
  };
};