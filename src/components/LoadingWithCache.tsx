import React, { useEffect, useState } from 'react';
import { useCacheManager } from '@/hooks/useCacheManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Trash2, AlertCircle } from 'lucide-react';

interface LoadingWithCacheProps {
  isLoading: boolean;
  loadingText?: string;
  timeout?: number;
  onTimeout?: () => void;
  children: React.ReactNode;
  operationName?: string;
}

const LoadingWithCache: React.FC<LoadingWithCacheProps> = ({
  isLoading,
  loadingText = "Loading...",
  timeout = 15000,
  onTimeout,
  children,
  operationName = "loading-operation"
}) => {
  const { startLoading, stopLoading, clearCache } = useCacheManager({
    operationName,
    enableAutoClean: true,
    showNotifications: false
  });
  
  const [operationId, setOperationId] = useState<string | null>(null);
  const [showCacheOptions, setShowCacheOptions] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);

  // Start loading operation
  useEffect(() => {
    if (isLoading && !operationId) {
      const id = startLoading();
      setOperationId(id);
      setLoadingTime(0);
      setShowCacheOptions(false);
    } else if (!isLoading && operationId) {
      stopLoading(operationId);
      setOperationId(null);
      setLoadingTime(0);
      setShowCacheOptions(false);
    }
  }, [isLoading, operationId, startLoading, stopLoading]);

  // Track loading time
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 1000;
        
        // Show cache options after timeout
        if (newTime >= timeout && !showCacheOptions) {
          setShowCacheOptions(true);
          onTimeout?.();
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, timeout, onTimeout, showCacheOptions]);

  const handleClearCache = async (level: 'light' | 'medium' | 'full') => {
    await clearCache(level);
    setShowCacheOptions(false);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {/* Loading indicator */}
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{loadingText}</p>
          {loadingTime > 0 && (
            <p className="text-xs text-muted-foreground">
              Loading for {formatTime(loadingTime)}
            </p>
          )}
        </div>
      </div>

      {/* Cache management options */}
      {showCacheOptions && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Loading is taking longer than expected
              </span>
            </div>
            
            <p className="text-xs text-yellow-700">
              This might be due to cached data conflicts. Try clearing the cache to improve performance.
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleClearCache('light')}
                className="flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Light Clean
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleClearCache('medium')}
                className="flex-1"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Deep Clean
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {children}
    </div>
  );
};

export default LoadingWithCache;