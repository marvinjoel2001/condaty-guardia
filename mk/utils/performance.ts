import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetrics {
  timestamp: number;
  appStartupTime?: number;
  memoryUsage?: number;
  fps?: number;
  bundleSize?: number;
  navigationTime?: number;
  componentRenderTime?: number;
  modalOpenTime?: number;
  modalCloseTime?: number;
  gestureResponseTime?: number;
  screenTransitionTime?: number;
  drawerOpenTime?: number;
  drawerCloseTime?: number;
  footerNavigationTime?: number;
  lazyLoadTime?: number;
  reRenderCount?: number;
  memoryLeakIndicators?: number;
}

export interface PerformanceConfig {
  enabled: boolean;
  trackMemory: boolean;
  trackFPS: boolean;
  trackBundleSize: boolean;
  persistData: boolean;
  alertThresholds: {
    appStartupTime: number;
    memoryUsage: number;
    fps: number;
    navigationTime: number;
    modalOpenTime: number;
  };
}

// Default configuration - can be disabled in production
export const defaultPerformanceConfig: PerformanceConfig = {
  enabled: __DEV__, // Only enabled in development by default
  trackMemory: true,
  trackFPS: true,
  trackBundleSize: true,
  persistData: true,
  alertThresholds: {
    appStartupTime: 2000, // 2 seconds
    memoryUsage: 100 * 1024 * 1024, // 100MB
    fps: 50,
    navigationTime: 200, // 200ms
    modalOpenTime: 150, // 150ms
  },
};

let currentConfig = { ...defaultPerformanceConfig };

// Configure performance monitoring
export const configurePerformanceMonitoring = (
  config: Partial<PerformanceConfig>,
) => {
  currentConfig = { ...currentConfig, ...config };
};

// Check if monitoring is enabled
export const isPerformanceMonitoringEnabled = (): boolean =>
  currentConfig.enabled;

// Measure app startup time
export const measureAppStartupTime = (): number => {
  const startupTime = Date.now() - (global as any).__START_TIME__ || Date.now();
  return startupTime;
};

// Measure memory usage (approximation)
export const measureMemoryUsage = (): number | undefined => {
  if (!currentConfig.trackMemory) return undefined;

  // React Native doesn't provide direct memory access, but we can use some heuristics
  // This is a placeholder - in a real implementation, you might use native modules
  // or approximate based on component counts, etc.
  return undefined; // Not implemented due to RN limitations
};

// FPS monitoring using requestAnimationFrame
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private callback?: (fps: number) => void;

  start(callback?: (fps: number) => void) {
    this.callback = callback;
    this.lastTime = performance.now();
    this.measureFPS();
  }

  stop() {
    this.callback = undefined;
  }

  private measureFPS = () => {
    if (!this.callback) return;

    const now = performance.now();
    this.frameCount++;

    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.callback(this.fps);
      this.frameCount = 0;
      this.lastTime = now;
    }

    requestAnimationFrame(this.measureFPS);
  };

  getCurrentFPS(): number {
    return this.fps;
  }
}

// Bundle size measurement
export const measureBundleSize = (): number | undefined => {
  if (!currentConfig.trackBundleSize) return undefined;

  // This would typically be injected during build time
  return (global as any).__BUNDLE_SIZE__ || undefined;
};

// Performance measurement utility
export const measurePerformance = <T>(
  name: string,
  operation: () => T | Promise<T>,
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();

  return Promise.resolve(operation()).then(result => {
    const duration = performance.now() - start;
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return { result, duration };
  });
};

// Data persistence
const PERFORMANCE_DATA_KEY = '@performance_data';

export const savePerformanceData = async (
  data: PerformanceMetrics[],
): Promise<void> => {
  if (!currentConfig.persistData) return;

  try {
    await AsyncStorage.setItem(PERFORMANCE_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save performance data:', error);
  }
};

export const loadPerformanceData = async (): Promise<PerformanceMetrics[]> => {
  if (!currentConfig.persistData) return [];

  try {
    const data = await AsyncStorage.getItem(PERFORMANCE_DATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('Failed to load performance data:', error);
    return [];
  }
};

export const clearPerformanceData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PERFORMANCE_DATA_KEY);
  } catch (error) {
    console.warn('Failed to clear performance data:', error);
  }
};

// Alert system for performance issues
export const checkPerformanceAlerts = (
  metrics: PerformanceMetrics,
): string[] => {
  const alerts: string[] = [];

  if (
    metrics.appStartupTime &&
    metrics.appStartupTime > currentConfig.alertThresholds.appStartupTime
  ) {
    alerts.push(
      `App startup time exceeded threshold: ${metrics.appStartupTime}ms`,
    );
  }

  if (
    metrics.memoryUsage &&
    metrics.memoryUsage > currentConfig.alertThresholds.memoryUsage
  ) {
    alerts.push(
      `Memory usage exceeded threshold: ${(
        metrics.memoryUsage /
        1024 /
        1024
      ).toFixed(2)}MB`,
    );
  }

  if (metrics.fps && metrics.fps < currentConfig.alertThresholds.fps) {
    alerts.push(`FPS below threshold: ${metrics.fps}`);
  }

  if (
    metrics.navigationTime &&
    metrics.navigationTime > currentConfig.alertThresholds.navigationTime
  ) {
    alerts.push(
      `Navigation time exceeded threshold: ${metrics.navigationTime}ms`,
    );
  }

  if (
    metrics.modalOpenTime &&
    metrics.modalOpenTime > currentConfig.alertThresholds.modalOpenTime
  ) {
    alerts.push(
      `Modal open time exceeded threshold: ${metrics.modalOpenTime}ms`,
    );
  }

  return alerts;
};

// Utility to create performance marks
export const createPerformanceMark = (name: string) => {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
};

export const measurePerformanceMark = (
  startMark: string,
  endMark: string,
): number | undefined => {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.mark(endMark);
      performance.measure(`${startMark}-to-${endMark}`, startMark, endMark);
      const entries = performance.getEntriesByName(
        `${startMark}-to-${endMark}`,
      );
      if (entries.length > 0) {
        return entries[0].duration;
      }
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }
  }
  return undefined;
};
