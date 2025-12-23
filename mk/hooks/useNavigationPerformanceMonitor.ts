import { useCallback, useRef } from 'react';
import {
  PerformanceMetrics,
  isPerformanceMonitoringEnabled,
  savePerformanceData,
  loadPerformanceData,
  checkPerformanceAlerts,
  createPerformanceMark,
  measurePerformanceMark,
} from '../utils/performance';

interface NavigationPerformanceMetrics extends PerformanceMetrics {
  screenTransitionTime?: number;
  drawerOpenTime?: number;
  drawerCloseTime?: number;
  footerNavigationTime?: number;
  lazyLoadTime?: number;
  navigationType: 'screen' | 'drawer' | 'footer' | 'lazy';
  fromScreen?: string;
  toScreen?: string;
}

interface UseNavigationPerformanceMonitorOptions {
  onMetricsUpdate?: (metrics: NavigationPerformanceMetrics) => void;
  onAlert?: (alerts: string[]) => void;
}

export const useNavigationPerformanceMonitor = (
  options: UseNavigationPerformanceMonitorOptions = {},
) => {
  const navigationStartRef = useRef<{ [key: string]: number }>({});

  const startNavigationTracking = useCallback((navigationId: string) => {
    if (!isPerformanceMonitoringEnabled()) return;

    navigationStartRef.current[navigationId] = performance.now();
    createPerformanceMark(`nav-start-${navigationId}`);
  }, []);

  const endNavigationTracking = useCallback(
    async (
      navigationId: string,
      navigationType: NavigationPerformanceMetrics['navigationType'],
      fromScreen?: string,
      toScreen?: string,
    ) => {
      if (
        !isPerformanceMonitoringEnabled() ||
        !navigationStartRef.current[navigationId]
      ) {
        return;
      }

      const startTime = navigationStartRef.current[navigationId];
      const duration = performance.now() - startTime;
      const markDuration = measurePerformanceMark(
        `nav-start-${navigationId}`,
        `nav-end-${navigationId}`,
      );

      const metrics: NavigationPerformanceMetrics = {
        timestamp: Date.now(),
        navigationType,
        fromScreen,
        toScreen,
      };

      // Assign duration based on navigation type
      switch (navigationType) {
        case 'screen':
          metrics.screenTransitionTime = duration;
          break;
        case 'drawer':
          // For drawer, we need to determine if it's open or close
          if (toScreen) {
            metrics.drawerOpenTime = duration;
          } else {
            metrics.drawerCloseTime = duration;
          }
          break;
        case 'footer':
          metrics.footerNavigationTime = duration;
          break;
        case 'lazy':
          metrics.lazyLoadTime = duration;
          break;
      }

      options.onMetricsUpdate?.(metrics);

      // Check for alerts
      const alerts = checkPerformanceAlerts(metrics);
      if (alerts.length > 0) {
        options.onAlert?.(alerts);
      }

      // Save to persistent storage
      const existingData = await loadPerformanceData();
      existingData.push(metrics);
      await savePerformanceData(existingData.slice(-200)); // Keep last 200 navigation events

      // Clean up
      delete navigationStartRef.current[navigationId];

      console.log(
        `Navigation ${navigationType} from ${fromScreen || 'unknown'} to ${
          toScreen || 'unknown'
        } took ${duration.toFixed(2)}ms`,
      );
    },
    [options],
  );

  const trackScreenTransition = useCallback(
    (fromScreen: string, toScreen: string) => {
      const navigationId = `screen-${fromScreen}-to-${toScreen}-${Date.now()}`;
      startNavigationTracking(navigationId);

      // Return a function to end tracking
      return () =>
        endNavigationTracking(navigationId, 'screen', fromScreen, toScreen);
    },
    [startNavigationTracking, endNavigationTracking],
  );

  const trackDrawerOpen = useCallback(
    (screenName?: string) => {
      const navigationId = `drawer-open-${
        screenName || 'unknown'
      }-${Date.now()}`;
      startNavigationTracking(navigationId);

      return () =>
        endNavigationTracking(navigationId, 'drawer', undefined, screenName);
    },
    [startNavigationTracking, endNavigationTracking],
  );

  const trackDrawerClose = useCallback(
    (screenName?: string) => {
      const navigationId = `drawer-close-${
        screenName || 'unknown'
      }-${Date.now()}`;
      startNavigationTracking(navigationId);

      return () => endNavigationTracking(navigationId, 'drawer', screenName);
    },
    [startNavigationTracking, endNavigationTracking],
  );

  const trackFooterNavigation = useCallback(
    (fromTab: string, toTab: string) => {
      const navigationId = `footer-${fromTab}-to-${toTab}-${Date.now()}`;
      startNavigationTracking(navigationId);

      return () =>
        endNavigationTracking(navigationId, 'footer', fromTab, toTab);
    },
    [startNavigationTracking, endNavigationTracking],
  );

  const trackLazyLoading = useCallback(
    (componentName: string) => {
      const navigationId = `lazy-${componentName}-${Date.now()}`;
      startNavigationTracking(navigationId);

      return () =>
        endNavigationTracking(navigationId, 'lazy', undefined, componentName);
    },
    [startNavigationTracking, endNavigationTracking],
  );

  const exportNavigationMetrics = async (): Promise<
    NavigationPerformanceMetrics[]
  > => {
    const data = await loadPerformanceData();
    return data.filter(
      item =>
        item.screenTransitionTime !== undefined ||
        item.drawerOpenTime !== undefined ||
        item.drawerCloseTime !== undefined ||
        item.footerNavigationTime !== undefined ||
        item.lazyLoadTime !== undefined,
    ) as NavigationPerformanceMetrics[];
  };

  const getNavigationStats = async () => {
    const metrics = await exportNavigationMetrics();

    const stats = {
      totalNavigations: metrics.length,
      averageScreenTransition: 0,
      averageDrawerOpen: 0,
      averageDrawerClose: 0,
      averageFooterNavigation: 0,
      averageLazyLoad: 0,
      slowestScreenTransition: 0,
      slowestDrawerOpen: 0,
      slowestDrawerClose: 0,
      slowestFooterNavigation: 0,
      slowestLazyLoad: 0,
    };

    const screenTransitions = metrics
      .filter(m => m.screenTransitionTime)
      .map(m => m.screenTransitionTime!);
    const drawerOpens = metrics
      .filter(m => m.drawerOpenTime)
      .map(m => m.drawerOpenTime!);
    const drawerCloses = metrics
      .filter(m => m.drawerCloseTime)
      .map(m => m.drawerCloseTime!);
    const footerNavigations = metrics
      .filter(m => m.footerNavigationTime)
      .map(m => m.footerNavigationTime!);
    const lazyLoads = metrics
      .filter(m => m.lazyLoadTime)
      .map(m => m.lazyLoadTime!);

    if (screenTransitions.length > 0) {
      stats.averageScreenTransition =
        screenTransitions.reduce((a, b) => a + b, 0) / screenTransitions.length;
      stats.slowestScreenTransition = Math.max(...screenTransitions);
    }

    if (drawerOpens.length > 0) {
      stats.averageDrawerOpen =
        drawerOpens.reduce((a, b) => a + b, 0) / drawerOpens.length;
      stats.slowestDrawerOpen = Math.max(...drawerOpens);
    }

    if (drawerCloses.length > 0) {
      stats.averageDrawerClose =
        drawerCloses.reduce((a, b) => a + b, 0) / drawerCloses.length;
      stats.slowestDrawerClose = Math.max(...drawerCloses);
    }

    if (footerNavigations.length > 0) {
      stats.averageFooterNavigation =
        footerNavigations.reduce((a, b) => a + b, 0) / footerNavigations.length;
      stats.slowestFooterNavigation = Math.max(...footerNavigations);
    }

    if (lazyLoads.length > 0) {
      stats.averageLazyLoad =
        lazyLoads.reduce((a, b) => a + b, 0) / lazyLoads.length;
      stats.slowestLazyLoad = Math.max(...lazyLoads);
    }

    return stats;
  };

  return {
    startNavigationTracking,
    endNavigationTracking,
    trackScreenTransition,
    trackDrawerOpen,
    trackDrawerClose,
    trackFooterNavigation,
    trackLazyLoading,
    exportNavigationMetrics,
    getNavigationStats,
  };
};
