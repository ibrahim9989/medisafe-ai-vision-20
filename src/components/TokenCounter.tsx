
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTokenUsage } from '@/hooks/useTokenUsage';
import { Activity, Brain, Mic, BarChart3 } from 'lucide-react';

interface TokenCounterProps {
  featureType: 'prescription' | 'interpret_ai';
  prescriptionId?: string;
  className?: string;
}

const TokenCounter: React.FC<TokenCounterProps> = ({ 
  featureType, 
  prescriptionId, 
  className = "" 
}) => {
  const { getTotalTokens } = useTokenUsage();
  const [tokenCounts, setTokenCounts] = useState({
    gpt41: 0,
    stt: 0,
    lyzr: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the counters configuration to prevent re-renders
  const counters = useMemo(() => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'gpt41':
          return <Brain className="w-3 h-3 sm:w-4 sm:h-4" />;
        case 'stt':
          return <Mic className="w-3 h-3 sm:w-4 sm:h-4" />;
        case 'lyzr':
          return <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />;
        default:
          return <Activity className="w-3 h-3 sm:w-4 sm:h-4" />;
      }
    };

    const getLabel = (type: string) => {
      switch (type) {
        case 'gpt41':
          return 'AI Counter';
        case 'stt':
          return 'STT Counter';
        case 'lyzr':
          return 'Analysis Counter';
        default:
          return type;
      }
    };

    return featureType === 'prescription' 
      ? [
          { type: 'gpt41', count: tokenCounts.gpt41, label: getLabel('gpt41'), icon: getIcon('gpt41') },
          { type: 'stt', count: tokenCounts.stt, label: getLabel('stt'), icon: getIcon('stt') },
          { type: 'lyzr', count: tokenCounts.lyzr, label: getLabel('lyzr'), icon: getIcon('lyzr') }
        ]
      : [
          { type: 'gpt41', count: tokenCounts.gpt41, label: getLabel('gpt41'), icon: getIcon('gpt41') }
        ];
  }, [featureType, tokenCounts]);

  useEffect(() => {
    let isMounted = true;

    const fetchTokenCounts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch token counts with proper error handling
        const countersToFetch = featureType === 'prescription' 
          ? ['gpt41', 'stt', 'lyzr'] as const
          : ['gpt41'] as const;

        const results = await Promise.allSettled(
          countersToFetch.map(counterType => 
            getTotalTokens(featureType, counterType)
          )
        );

        if (isMounted) {
          const counts = {
            gpt41: 0,
            stt: 0,
            lyzr: 0,
            total: 0
          };

          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              const counterType = countersToFetch[index];
              counts[counterType] = result.value || 0;
            }
          });

          counts.total = counts.gpt41 + counts.stt + counts.lyzr;
          setTokenCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching token counts:', error);
        if (isMounted) {
          setTokenCounts({
            gpt41: 0,
            stt: 0,
            lyzr: 0,
            total: 0
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTokenCounts();

    return () => {
      isMounted = false;
    };
  }, [featureType, getTotalTokens]);

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 ${className}`}>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="truncate">Token Usage - {featureType === 'prescription' ? 'Prescription' : 'Interpret AI'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center py-4 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <span className="truncate">Token Usage - {featureType === 'prescription' ? 'Prescription' : 'Interpret AI'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {counters.map((counter) => (
            <div 
              key={counter.type}
              className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                {counter.icon}
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {counter.label}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                {counter.count.toLocaleString()}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-300">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
            <span className="font-semibold text-blue-900 text-xs sm:text-sm truncate">Total Tokens</span>
          </div>
          <Badge className="bg-blue-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm">
            {tokenCounts.total.toLocaleString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCounter;
