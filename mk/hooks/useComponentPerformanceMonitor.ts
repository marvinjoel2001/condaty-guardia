import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PerformanceMetrics,
  isPerformanceMonitoringEnabled,
  savePerformanceData,
  loadPerformanceData,
  checkPerformanceAlerts,
  createPerformanceMark,
  measurePerformanceMark,
} from '../utils/performance';

interface ComponentPerformanceMetrics extends PerformanceMetrics {
  componentName: string;
  componentRenderTime: number;
  reRenderCount: number;
  lifecycleMountTime?: number;
  lifecycleUpdateTime?: number;
  lifecycleUnmountTime?: number;
  memoryLeakIndicators?: number;
  renderFrequency?: number; // renders per minute
}

interface UseComponentPerformanceMonitorOptions {
  componentName: string;
  trackReRenders?: boolean;
  trackLifecycle?: boolean;
  trackMemoryLeaks?: boolean;
  onMetricsUpdate?: (metrics: ComponentPerformanceMetrics) => void;
  onAlert?: (alerts: string[]) => void;
}

export const useComponentPerformanceMonitor = ({
  componentName,
  trackReRenders = true,
  trackLifecycle = true,
  trackMemoryLeaks = true,
  onMetricsUpdate,
  onAlert,
}: UseComponentPerformanceMonitorOptions) => {
  const [metrics, setMetrics] = useState<ComponentPerformanceMetrics>({
    timestamp: Date.now(),
    componentName,
    componentRenderTime: 0,
    reRenderCount: 0,
  });

  const renderStartRef = useRef<number | null>(null);
  const mountTimeRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);
  const lifecycleStartRef = useRef<{ [key: string]: number }>({});
  const isMountedRef = useRef<boolean>(false);

  // Track component mount
  useEffect(() => {
    if (!isPerformanceMonitoringEnabled() || !trackLifecycle) return;

    mountTimeRef.current = performance.now();
    isMountedRef.current = true;

    createPerformanceMark(`${componentName}-mount-start`);

    return () => {
      if (trackLifecycle && mountTimeRef.current) {
        const unmountTime = performance.now() - mountTimeRef.current;
        createPerformanceMark(`${componentName}-unmount`);

        const lifecycleMetrics: ComponentPerformanceMetrics = {
          ...metrics,
          timestamp: Date.now(),
          lifecycleUnmountTime: unmountTime,
          memoryLeakIndicators: trackMemoryLeaks
            ? detectMemoryLeaks()
            : undefined,
        };

        setMetrics(lifecycleMetrics);
        onMetricsUpdate?.(lifecycleMetrics);

        // Check for alerts
        const alerts = checkPerformanceAlerts(lifecycleMetrics);
        if (alerts.length > 0) {
          onAlert?.(alerts);
        }

        // Save to persistent storage
        saveComponentMetrics(lifecycleMetrics);
      }

      isMountedRef.current = false;
    };
  }, [componentName, trackLifecycle, trackMemoryLeaks]);

  // Track render performance
  useEffect(() => {
    if (!isPerformanceMonitoringEnabled()) return;

    renderStartRef.current = performance.now();
    renderCountRef.current += 1;

    createPerformanceMark(
      `${componentName}-render-start-${renderCountRef.current}`,
    );

    return () => {
      if (renderStartRef.current) {
        const renderTime = performance.now() - renderStartRef.current;
        const now = Date.now();
        const timeSinceLastRender = now - lastRenderTimeRef.current;
        const renderFrequency =
          timeSinceLastRender > 0 ? (60 * 1000) / timeSinceLastRender : 0;

        createPerformanceMark(
          `${componentName}-render-end-${renderCountRef.current}`,
        );

        const renderMetrics: ComponentPerformanceMetrics = {
          ...metrics,
          timestamp: now,
          componentRenderTime: renderTime,
          reRenderCount: renderCountRef.current,
          renderFrequency: trackReRenders ? renderFrequency : undefined,
        };

        setMetrics(renderMetrics);
        onMetricsUpdate?.(renderMetrics);

        // Check for alerts
        const alerts = checkPerformanceAlerts(renderMetrics);
        if (alerts.length > 0) {
          onAlert?.(alerts);
        }

        // Save to persistent storage
        saveComponentMetrics(renderMetrics);

        lastRenderTimeRef.current = now;
        renderStartRef.current = null;
      }
    };
  });

  // Track lifecycle updates
  const trackLifecycleUpdate = useCallback(
    (phase: 'update' | 'effect') => {
      if (!isPerformanceMonitoringEnabled() || !trackLifecycle) return;

      const key = `${phase}-${Date.now()}`;
      lifecycleStartRef.current[key] = performance.now();

      createPerformanceMark(`${componentName}-lifecycle-${phase}-start`);

      return () => {
        const startTime = lifecycleStartRef.current[key];
        if (startTime) {
          const duration = performance.now() - startTime;
          createPerformanceMark(`${componentName}-lifecycle-${phase}-end`);

          const lifecycleMetrics: ComponentPerformanceMetrics = {
            ...metrics,
            timestamp: Date.now(),
            lifecycleUpdateTime:
              phase === 'update' ? duration : metrics.lifecycleUpdateTime,
          };

          setMetrics(lifecycleMetrics);
          onMetricsUpdate?.(lifecycleMetrics);

          delete lifecycleStartRef.current[key];
        }
      };
    },
    [componentName, trackLifecycle, metrics, onMetricsUpdate],
  );

  // Memory leak detection (simplified)
  const detectMemoryLeaks = useCallback((): number => {
    if (!trackMemoryLeaks) return 0;

    // Simple heuristics for memory leak detection
    // In a real implementation, this would use more sophisticated methods
    const leakIndicators = 0;

    // Check for excessive re-renders
    if (renderCountRef.current > 100) {
      return leakIndicators + 1;
    }

    // Check for components that stay mounted too long
    if (mountTimeRef.current && Date.now() - mountTimeRef.current > 300000) {
      // 5 minutes
      return leakIndicators + 1;
    }

    return leakIndicators;
  }, [trackMemoryLeaks]);

  // Save component metrics
  const saveComponentMetrics = async (
    componentMetrics: ComponentPerformanceMetrics,
  ) => {
    const existingData = await loadPerformanceData();
    const componentData = existingData.filter(
      item =>
        (item as ComponentPerformanceMetrics).componentName === componentName,
    );

    componentData.push(componentMetrics);

    // Keep only last 50 metrics per component
    const filteredData = existingData.filter(
      item =>
        (item as ComponentPerformanceMetrics).componentName !== componentName,
    );
    filteredData.push(...componentData.slice(-50));

    await savePerformanceData(filteredData);
  };

  const getComponentMetrics = useCallback(async (): Promise<
    ComponentPerformanceMetrics[]
  > => {
    const data = await loadPerformanceData();
    return data.filter(
      item =>
        (item as ComponentPerformanceMetrics).componentName === componentName,
    ) as ComponentPerformanceMetrics[];
  }, [componentName]);

  const getComponentStats = useCallback(async () => {
    const componentMetrics = await getComponentMetrics();

    if (componentMetrics.length === 0) {
      return {
        totalRenders: 0,
        averageRenderTime: 0,
        maxRenderTime: 0,
        totalReRenders: 0,
        averageRenderFrequency: 0,
        memoryLeakRisk: 0,
      };
    }

    const renderTimes = componentMetrics
      .filter(m => m.componentRenderTime)
      .map(m => m.componentRenderTime);

    const renderFrequencies = componentMetrics
      .filter(m => m.renderFrequency !== undefined)
      .map(m => m.renderFrequency!);

    const memoryLeakIndicators = componentMetrics
      .filter(m => m.memoryLeakIndicators !== undefined)
      .map(m => m.memoryLeakIndicators!);

    return {
      totalRenders: componentMetrics.length,
      averageRenderTime:
        renderTimes.length > 0
          ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
          : 0,
      maxRenderTime: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
      totalReRenders: Math.max(...componentMetrics.map(m => m.reRenderCount)),
      averageRenderFrequency:
        renderFrequencies.length > 0
          ? renderFrequencies.reduce((a, b) => a + b, 0) /
            renderFrequencies.length
          : 0,
      memoryLeakRisk:
        memoryLeakIndicators.length > 0
          ? memoryLeakIndicators.reduce((a, b) => a + b, 0) /
            memoryLeakIndicators.length
          : 0,
    };
  }, [getComponentMetrics]);

  const logComponentMetrics = useCallback(() => {
    if (!isPerformanceMonitoringEnabled()) return;

    console.log(`Component ${componentName} Performance:`, {
      renderTime: `${metrics.componentRenderTime.toFixed(2)}ms`,
      reRenderCount: metrics.reRenderCount,
      renderFrequency: metrics.renderFrequency
        ? `${metrics.renderFrequency.toFixed(2)} renders/min`
        : 'N/A',
      memoryLeakIndicators: metrics.memoryLeakIndicators || 0,
    });
  }, [componentName, metrics]);

  return {
    metrics,
    trackLifecycleUpdate,
    getComponentMetrics,
    getComponentStats,
    logComponentMetrics,
    isMounted: isMountedRef.current,
  };
};
