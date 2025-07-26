import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCacheManager } from '@/hooks/useCacheManager';
import { 
  RefreshCw, 
  Trash2, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface CacheMonitorProps {
  showDetails?: boolean;
}

const CacheMonitor: React.FC<CacheMonitorProps> = ({ showDetails = false }) => {
  const { clearCache, getCacheStats } = useCacheManager();
  const [stats, setStats] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      setStats(getCacheStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getCacheStats]);

  const handleClearCache = async (level: 'light' | 'medium' | 'full') => {
    setIsClearing(true);
    try {
      await clearCache(level);
    } finally {
      setIsClearing(false);
    }
  };

  if (!showDetails && (!stats?.activeOperations || stats.activeOperations === 0)) {
    return null; // Don't show if no active operations and details not requested
  }

  const getStatusColor = () => {
    if (!stats) return 'gray';
    if (stats.activeOperations > 3) return 'red';
    if (stats.activeOperations > 1) return 'yellow';
    return 'green';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    switch (color) {
      case 'red': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'yellow': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Cache Monitor
            {getStatusIcon()}
          </CardTitle>
          <Badge variant={getStatusColor() === 'green' ? 'default' : 'destructive'}>
            {stats?.activeOperations || 0} Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleClearCache('light')}
            disabled={isClearing}
            className="flex-1"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isClearing ? 'animate-spin' : ''}`} />
            Light Clean
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleClearCache('medium')}
            disabled={isClearing}
            className="flex-1"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Deep Clean
          </Button>
        </div>

        {showDetails && stats && (
          <>
            {/* Performance Stats */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Performance Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stats.cacheStats || {}).map(([operation, data]: [string, any]) => (
                  <div key={operation} className="bg-muted/50 p-2 rounded text-xs">
                    <div className="font-medium capitalize">{operation}</div>
                    <div className="text-muted-foreground">
                      Hits: {data.hits} | Misses: {data.misses}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Actions */}
            {stats.lastLog && stats.lastLog.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Recent Cache Actions</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {stats.lastLog.map((log: any, index: number) => (
                    <div key={index} className="text-xs bg-muted/30 p-1 rounded">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Actions */}
            <div className="pt-2 border-t">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleClearCache('full')}
                disabled={isClearing}
                className="w-full"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Full Cache Reset (Emergency)
              </Button>
            </div>
          </>
        )}

        {/* Memory Warning */}
        {typeof window !== 'undefined' && 'memory' in performance && (
          <div className="text-xs text-muted-foreground">
            {(() => {
              const memory = (performance as any).memory;
              const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
              if (usedPercent > 85) {
                return (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle className="h-3 w-3" />
                    High memory usage: {usedPercent.toFixed(1)}%
                  </div>
                );
              }
              return (
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Memory: {usedPercent.toFixed(1)}%
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CacheMonitor;