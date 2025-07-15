
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
          return <Brain className="w-4 h-4" />;
        case 'stt':
          return <Mic className="w-4 h-4" />;
        case 'lyzr':
          return <BarChart3 className="w-4 h-4" />;
        default:
          return <Activity className="w-4 h-4" />;
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
        
        const [gpt41Count, sttCount, lyzrCount] = await Promise.all([
          getTotalTokens(featureType, 'gpt41'),
          getTotalTokens(featureType, 'stt'),
          getTotalTokens(featureType, 'lyzr')
        ]);

        if (isMounted) {
          const total = gpt41Count + sttCount + lyzrCount;

          setTokenCounts({
            gpt41: gpt41Count,
            stt: sttCount,
            lyzr: lyzrCount,
            total
          });
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

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [featureType, getTotalTokens]);

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Token Usage - {featureType === 'prescription' ? 'Prescription Management' : 'Interpret AI'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Token Usage - {featureType === 'prescription' ? 'Prescription Management' : 'Interpret AI'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {counters.map((counter) => (
            <div 
              key={counter.type}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2">
                {counter.icon}
                <span className="text-sm font-medium text-gray-700">
                  {counter.label}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {counter.count.toLocaleString()}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-300">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-700" />
            <span className="font-semibold text-blue-900">Total Tokens</span>
          </div>
          <Badge className="bg-blue-600 text-white px-3 py-1">
            {tokenCounts.total.toLocaleString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCounter;
