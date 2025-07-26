import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CacheConfig {
  maxLoadTime: number; // milliseconds
  retryAttempts: number;
  escalationLevels: string[];
}

interface LoadingOperation {
  id: string;
  startTime: number;
  operation: string;
  timeout?: NodeJS.Timeout;
}

class CacheManager {
  private static instance: CacheManager;
  private queryClient: QueryClient | null = null;
  private activeOperations: Map<string, LoadingOperation> = new Map();
  private config: CacheConfig;
  private cacheStats: Map<string, { hits: number; misses: number; lastClear: number }> = new Map();

  constructor() {
    this.config = {
      maxLoadTime: 15000, // 15 seconds
      retryAttempts: 3,
      escalationLevels: ['react-query', 'supabase', 'browser', 'full-reload']
    };
    
    // Monitor performance
    this.setupPerformanceMonitoring();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  // Start monitoring a loading operation
  startOperation(id: string, operation: string): void {
    console.log(`CacheManager: Starting operation ${id} (${operation})`);
    
    const loadingOp: LoadingOperation = {
      id,
      startTime: Date.now(),
      operation,
      timeout: setTimeout(() => {
        this.handleSlowOperation(id);
      }, this.config.maxLoadTime)
    };

    this.activeOperations.set(id, loadingOp);
  }

  // Complete a loading operation
  completeOperation(id: string): void {
    const operation = this.activeOperations.get(id);
    if (operation) {
      const duration = Date.now() - operation.startTime;
      console.log(`CacheManager: Completed operation ${id} in ${duration}ms`);
      
      if (operation.timeout) {
        clearTimeout(operation.timeout);
      }
      
      this.activeOperations.delete(id);
      this.updateCacheStats(operation.operation, duration);
    }
  }

  // Handle slow loading operations
  private async handleSlowOperation(id: string): Promise<void> {
    const operation = this.activeOperations.get(id);
    if (!operation) return;

    const duration = Date.now() - operation.startTime;
    console.warn(`CacheManager: Slow operation detected - ${id} (${duration}ms)`);

    // Progressive cache clearing
    await this.progressiveCacheClear(operation.operation, duration);
  }

  // Progressive cache clearing based on severity
  private async progressiveCacheClear(operation: string, duration: number): Promise<void> {
    console.log(`CacheManager: Starting progressive cache clear for ${operation}`);

    try {
      // Level 1: Clear React Query cache (least disruptive)
      if (duration > 15000) {
        await this.clearReactQueryCache();
      }

      // Level 2: Clear Supabase client cache
      if (duration > 25000) {
        await this.clearSupabaseCache();
      }

      // Level 3: Clear browser storage and caches
      if (duration > 35000) {
        await this.clearBrowserCache();
      }

      // Level 4: Force page reload (last resort)
      if (duration > 45000) {
        await this.forceReload();
      }
    } catch (error) {
      console.error('CacheManager: Error during cache clearing:', error);
    }
  }

  // Clear React Query cache
  private async clearReactQueryCache(): Promise<void> {
    if (!this.queryClient) return;

    console.log('CacheManager: Clearing React Query cache');
    
    try {
      // Clear all queries
      this.queryClient.clear();
      
      // Force garbage collection of stale queries
      this.queryClient.removeQueries();
      
      // Reset query defaults
      this.queryClient.setDefaultOptions({
        queries: {
          staleTime: 0,
          gcTime: 0,
        },
      });

      this.logCacheAction('react-query-clear');
    } catch (error) {
      console.error('CacheManager: Failed to clear React Query cache:', error);
    }
  }

  // Clear Supabase client cache
  private async clearSupabaseCache(): Promise<void> {
    console.log('CacheManager: Clearing Supabase cache');
    
    try {
      // Force refresh session
      await supabase.auth.refreshSession();
      
      // Clear any client-side Supabase cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const supabaseCaches = cacheNames.filter(name => 
          name.includes('supabase') || name.includes('postgrest')
        );
        
        await Promise.all(
          supabaseCaches.map(name => caches.delete(name))
        );
      }

      this.logCacheAction('supabase-clear');
    } catch (error) {
      console.error('CacheManager: Failed to clear Supabase cache:', error);
    }
  }

  // Clear browser cache and storage
  private async clearBrowserCache(): Promise<void> {
    console.log('CacheManager: Clearing browser cache');
    
    try {
      // Clear localStorage items (keep auth-related items)
      const authKeys = ['sb-access-token', 'sb-refresh-token'];
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !authKeys.some(authKey => key.includes(authKey))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB caches
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases();
          await Promise.all(
            databases.map(db => {
              if (db.name && !db.name.includes('supabase-auth')) {
                return new Promise<void>((resolve, reject) => {
                  const deleteReq = indexedDB.deleteDatabase(db.name!);
                  deleteReq.onsuccess = () => resolve();
                  deleteReq.onerror = () => reject(deleteReq.error);
                });
              }
            })
          );
        } catch (error) {
          console.warn('CacheManager: IndexedDB cleanup failed:', error);
        }
      }

      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const nonCriticalCaches = cacheNames.filter(name => 
          !name.includes('auth') && !name.includes('critical')
        );
        
        await Promise.all(
          nonCriticalCaches.map(name => caches.delete(name))
        );
      }

      this.logCacheAction('browser-clear');
    } catch (error) {
      console.error('CacheManager: Failed to clear browser cache:', error);
    }
  }

  // Force page reload (last resort)
  private async forceReload(): Promise<void> {
    console.warn('CacheManager: Forcing page reload due to persistent slow loading');
    
    try {
      // Clear all possible caches before reload
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      this.logCacheAction('force-reload');
      
      // Add a flag to prevent infinite reload loops
      sessionStorage.setItem('cache-manager-reload', Date.now().toString());
      
      // Force reload with cache bypass
      window.location.reload();
    } catch (error) {
      console.error('CacheManager: Failed to force reload:', error);
    }
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Long tasks > 50ms
              console.warn(`CacheManager: Long task detected: ${entry.duration}ms`);
              this.handleLongTask(entry.duration);
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('CacheManager: Performance monitoring not available');
      }
    }

    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  // Handle long tasks
  private handleLongTask(duration: number): void {
    if (duration > 200) { // Very long task
      console.warn('CacheManager: Very long task detected, clearing lightweight caches');
      this.clearLightweightCaches();
    }
  }

  // Clear lightweight caches only
  private async clearLightweightCaches(): Promise<void> {
    try {
      // Clear only non-critical React Query data
      if (this.queryClient) {
        this.queryClient.removeQueries({
          predicate: (query) => {
            // Keep auth and critical data
            return !query.queryKey.some(key => 
              typeof key === 'string' && 
              (key.includes('auth') || key.includes('profile') || key.includes('critical'))
            );
          }
        });
      }

      // Clear temporary sessionStorage
      const tempKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('temp') || key.includes('cache')
      );
      tempKeys.forEach(key => sessionStorage.removeItem(key));

      this.logCacheAction('lightweight-clear');
    } catch (error) {
      console.error('CacheManager: Failed to clear lightweight caches:', error);
    }
  }

  // Monitor memory usage
  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 85) {
          console.warn(`CacheManager: High memory usage detected: ${usedPercent.toFixed(1)}%`);
          this.clearLightweightCaches();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Update cache statistics
  private updateCacheStats(operation: string, duration: number): void {
    const stats = this.cacheStats.get(operation) || { hits: 0, misses: 0, lastClear: 0 };
    
    if (duration > this.config.maxLoadTime) {
      stats.misses++;
    } else {
      stats.hits++;
    }
    
    this.cacheStats.set(operation, stats);
  }

  // Log cache actions for debugging
  private logCacheAction(action: string): void {
    const timestamp = new Date().toISOString();
    console.log(`CacheManager: ${action} at ${timestamp}`);
    
    // Store in sessionStorage for debugging
    const log = JSON.parse(sessionStorage.getItem('cache-manager-log') || '[]');
    log.push({ action, timestamp });
    
    // Keep only last 50 entries
    if (log.length > 50) {
      log.splice(0, log.length - 50);
    }
    
    sessionStorage.setItem('cache-manager-log', JSON.stringify(log));
  }

  // Get cache statistics
  getCacheStats(): Record<string, any> {
    return {
      activeOperations: this.activeOperations.size,
      cacheStats: Object.fromEntries(this.cacheStats),
      config: this.config,
      lastLog: JSON.parse(sessionStorage.getItem('cache-manager-log') || '[]').slice(-10)
    };
  }

  // Manual cache clear
  async clearCache(level: 'light' | 'medium' | 'full' = 'medium'): Promise<void> {
    console.log(`CacheManager: Manual cache clear (${level})`);
    
    switch (level) {
      case 'light':
        await this.clearLightweightCaches();
        break;
      case 'medium':
        await this.clearReactQueryCache();
        await this.clearLightweightCaches();
        break;
      case 'full':
        await this.clearReactQueryCache();
        await this.clearSupabaseCache();
        await this.clearBrowserCache();
        break;
    }
  }
}

export const cacheManager = CacheManager.getInstance();
