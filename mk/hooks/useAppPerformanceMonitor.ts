import { useEffect, useRef, useState } from 'react';
import {
  FPSMonitor,
  PerformanceMetrics,
  measureAppStartupTime,
  measureMemoryUsage,
  measureBundleSize,
  isPerformanceMonitoringEnabled,
  savePerformanceData,
  loadPerformanceData,
  checkPerformanceAlerts,
} from '../utils/performance';

interface AppPerformanceMetrics extends PerformanceMetrics {
  appStartupTime: number;
  memoryUsage?: number;
  fps: number;
  bundleSize?: number;
}

interface UseAppPerformanceMonitorOptions {
  onMetricsUpdate?: (metrics: AppPerformanceMetrics) => void;
  onAlert?: (alerts: string[]) => void;
}

export const useAppPerformanceMonitor = (
  options: UseAppPerformanceMonitorOptions = {},
) => {
  const [metrics, setMetrics] = useState<AppPerformanceMetrics>({
    timestamp: Date.now(),
    appStartupTime: 0,
    fps: 60,
  });

  const fpsMonitorRef = useRef<FPSMonitor | null>(null);
  const memoryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isPerformanceMonitoringEnabled() || isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;

    // Initialize FPS monitor
    fpsMonitorRef.current = new FPSMonitor();
    fpsMonitorRef.current.start(fps => {
      setMetrics(prev => {
        const newMetrics = { ...prev, fps, timestamp: Date.now() };
        options.onMetricsUpdate?.(newMetrics);
        return newMetrics;
      });
    });

    // Measure initial metrics
    const initializeMetrics = async () => {
      const startupTime = measureAppStartupTime();
      const bundleSize = measureBundleSize();
      const memoryUsage = measureMemoryUsage();

      const initialMetrics: AppPerformanceMetrics = {
        timestamp: Date.now(),
        appStartupTime: startupTime,
        fps: fpsMonitorRef.current?.getCurrentFPS() || 60,
        bundleSize,
        memoryUsage,
      };

      setMetrics(initialMetrics);
      options.onMetricsUpdate?.(initialMetrics);

      // Check for alerts
      const alerts = checkPerformanceAlerts(initialMetrics);
      if (alerts.length > 0) {
        options.onAlert?.(alerts);
      }

      // Save to persistent storage
      const existingData = await loadPerformanceData();
      existingData.push(initialMetrics);
      await savePerformanceData(existingData.slice(-100)); // Keep last 100 entries
    };

    initializeMetrics();

    // Set up memory monitoring interval (if enabled)
    if (measureMemoryUsage() !== undefined) {
      memoryIntervalRef.current = setInterval(() => {
        const memoryUsage = measureMemoryUsage();
        if (memoryUsage !== undefined) {
          setMetrics(prev => {
            const newMetrics = { ...prev, memoryUsage, timestamp: Date.now() };
            options.onMetricsUpdate?.(newMetrics);

            // Check for memory alerts
            const alerts = checkPerformanceAlerts(newMetrics);
            if (alerts.length > 0) {
              options.onAlert?.(alerts);
            }

            return newMetrics;
          });
        }
      }, 30000); // Check every 30 seconds
    }

    // Cleanup function
    return () => {
      if (fpsMonitorRef.current) {
        fpsMonitorRef.current.stop();
      }
      if (memoryIntervalRef.current) {
        clearInterval(memoryIntervalRef.current);
      }
    };
  }, []);

  const getCurrentMetrics = (): AppPerformanceMetrics => metrics;

  const logMetrics = () => {
    if (!isPerformanceMonitoringEnabled()) return;

    console.log('App Performance Metrics:', {
      startupTime: `${metrics.appStartupTime}ms`,
      fps: metrics.fps,
      memoryUsage: metrics.memoryUsage
        ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`
        : 'N/A',
      bundleSize: metrics.bundleSize
        ? `${(metrics.bundleSize / 1024 / 1024).toFixed(2)}MB`
        : 'N/A',
    });
  };

  const exportMetrics = async (): Promise<AppPerformanceMetrics[]> => {
    const data = await loadPerformanceData();
    return data.filter(
      item => item.appStartupTime !== undefined,
    ) as AppPerformanceMetrics[];
  };

  return {
    metrics,
    getCurrentMetrics,
    logMetrics,
    exportMetrics,
  };
};
