import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  bundleSize?: number;
  loadTime: number;
  memoryUsage?: number;
  navigationTime?: number;
}

interface PerformanceMonitorOptions {
  trackBundleSize?: boolean;
  trackMemoryUsage?: boolean;
  trackNavigationTime?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = (
  options: PerformanceMonitorOptions = {},
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
  });

  const startTimeRef = useRef<number>(Date.now());
  const navigationStartRef = useRef<number | null>(null);

  useEffect(() => {
    // Track initial load time
    const loadTime = Date.now() - startTimeRef.current;
    setMetrics(prev => ({ ...prev, loadTime }));

    if (options.onMetricsUpdate) {
      options.onMetricsUpdate({ ...metrics, loadTime });
    }

    // Track bundle size if requested
    if (options.trackBundleSize && (global as any).__BUNDLE_SIZE__) {
      setMetrics(prev => ({
        ...prev,
        bundleSize: (global as any).__BUNDLE_SIZE__,
      }));
    }

    // Track memory usage if requested
    if (options.trackMemoryUsage) {
      const trackMemory = () => {
        // Note: Memory tracking is limited in React Native
        // This is a placeholder for future implementation
        console.log('Memory tracking not fully implemented in RN');
      };

      const memoryInterval = setInterval(trackMemory, 30000); // Every 30 seconds
      return () => clearInterval(memoryInterval);
    }
  }, []);

  const startNavigationTracking = () => {
    if (options.trackNavigationTime) {
      navigationStartRef.current = Date.now();
    }
  };

  const endNavigationTracking = (screenName?: string) => {
    if (options.trackNavigationTime && navigationStartRef.current) {
      const navigationTime = Date.now() - navigationStartRef.current;
      setMetrics(prev => ({ ...prev, navigationTime }));

      if (options.onMetricsUpdate) {
        options.onMetricsUpdate({ ...metrics, navigationTime });
      }

      console.log(
        `Navigation to ${screenName || 'screen'} took ${navigationTime}ms`,
      );
      navigationStartRef.current = null;
    }
  };

  const logMetrics = () => {
    console.log('Performance Metrics:', metrics);
  };

  return {
    metrics,
    startNavigationTracking,
    endNavigationTracking,
    logMetrics,
  };
};

// Global performance observer for bundle chunks
export const setupPerformanceObserver = () => {
  if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    return observer;
  }
  return null;
};

// Utility to measure screen loading time
export const measureScreenLoad = (screenName: string, startTime: number) => {
  const loadTime = Date.now() - startTime;
  console.log(`Screen ${screenName} loaded in ${loadTime}ms`);

  // Send to analytics if available
  if ((global as any).__ANALYTICS__) {
    (global as any).__ANALYTICS__.track('screen_load', {
      screen: screenName,
      loadTime,
    });
  }

  return loadTime;
};
