
import React from 'react';
import { useTokenUsage } from '@/hooks/useTokenUsage';
import { toast } from '@/hooks/use-toast';

interface RadioGPTTokenTrackerProps {
  onTokenUsage: (tokens: number) => void;
}

export const useRadioGPTTokenTracker = () => {
  const { logTokenUsage } = useTokenUsage();

  const trackTokenUsage = async (tokens_used: number, sessionId?: string) => {
    try {
      await logTokenUsage({
        feature_type: 'radiogpt',
        counter_type: 'gemini',
        tokens_used,
        session_id: sessionId || `radiogpt-${Date.now()}`
      });

      console.log(`✅ RadioGPT token usage logged: ${tokens_used} tokens`);
    } catch (error) {
      console.error('Failed to log Interpret AI token usage:', error);
      toast({
        title: "Token Logging Error",
        description: "Failed to log token usage for RadioGPT",
        variant: "destructive"
      });
    }
  };

  return { trackTokenUsage };
};
