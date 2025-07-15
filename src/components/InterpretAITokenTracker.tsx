
import React from 'react';
import { useTokenUsage } from '@/hooks/useTokenUsage';
import { toast } from '@/hooks/use-toast';

interface InterpretAITokenTrackerProps {
  onTokenUsage: (tokens: number) => void;
}

export const useInterpretAITokenTracker = () => {
  const { logTokenUsage } = useTokenUsage();

  const trackTokenUsage = async (tokens_used: number, sessionId?: string) => {
    try {
      await logTokenUsage({
        feature_type: 'interpret_ai',
        counter_type: 'gpt41',
        tokens_used,
        session_id: sessionId || `interpret-ai-${Date.now()}`
      });

      console.log(`✅ Interpret AI token usage logged: ${tokens_used} tokens`);
    } catch (error) {
      console.error('Failed to log Interpret AI token usage:', error);
      toast({
        title: "Token Logging Error",
        description: "Failed to log token usage for Interpret AI",
        variant: "destructive"
      });
    }
  };

  return { trackTokenUsage };
};
