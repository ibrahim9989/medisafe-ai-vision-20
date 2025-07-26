import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cacheManager } from '@/utils/cacheManager';
import { toast } from '@/hooks/use-toast';

interface UseCacheManagerOptions {
  enableAutoClean?: boolean;
  showNotifications?: boolean;
  operationName?: string;
}

export const useCacheManager = (options: UseCacheManagerOptions = {}) => {
  const queryClient = useQueryClient();
  const {
    enableAutoClean = true,
    showNotifications = true,
    operationName = 'unknown'
  } = options;

  // Initialize cache manager with query client
  useEffect(() => {
    cacheManager.setQueryClient(queryClient);
  }, [queryClient]);

  // Monitor loading operations
  const startLoading = useCallback((id?: string) => {
    const operationId = id || `${operationName}-${Date.now()}`;
    cacheManager.startOperation(operationId, operationName);
    return operationId;
  }, [operationName]);

  const stopLoading = useCallback((id: string) => {
    cacheManager.completeOperation(id);
  }, []);

  // Manual cache clearing functions
  const clearCache = useCallback(async (level: 'light' | 'medium' | 'full' = 'medium') => {
    try {
      if (showNotifications) {
        toast({
          title: "Clearing Cache",
          description: `Clearing ${level} cache to improve performance...`,
        });
      }

      await cacheManager.clearCache(level);

      if (showNotifications) {
        toast({
          title: "Cache Cleared",
          description: "Cache has been cleared successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      if (showNotifications) {
        toast({
          title: "Cache Clear Failed",
          description: "Failed to clear cache. Please try refreshing the page.",
          variant: "destructive"
        });
      }
    }
  }, [showNotifications]);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return cacheManager.getCacheStats();
  }, []);

  // Auto-clear cache on component mount if needed
  useEffect(() => {
    if (!enableAutoClean) return;

    // Check if we recently reloaded due to cache issues
    const lastReload = sessionStorage.getItem('cache-manager-reload');
    if (lastReload) {
      const reloadTime = parseInt(lastReload);
      const timeSinceReload = Date.now() - reloadTime;
      
      // If we reloaded recently (within 1 minute), clear the flag and show notification
      if (timeSinceReload < 60000) {
        sessionStorage.removeItem('cache-manager-reload');
        if (showNotifications) {
          toast({
            title: "Performance Optimized",
            description: "Cache was automatically cleared to improve loading times.",
          });
        }
      }
    }

    // Check for persistent performance issues
    const performanceEntries = performance.getEntriesByType('navigation');
    if (performanceEntries.length > 0) {
      const navigation = performanceEntries[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      if (loadTime > 10000) { // More than 10 seconds
        console.warn(`Slow page load detected: ${loadTime}ms`);
        setTimeout(() => clearCache('light'), 2000); // Clear after initial load
      }
    }
  }, [enableAutoClean, showNotifications, clearCache]);

  return {
    startLoading,
    stopLoading,
    clearCache,
    getCacheStats,
    cacheManager
  };
};