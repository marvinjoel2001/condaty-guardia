import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  PerformanceMetrics,
  isPerformanceMonitoringEnabled,
  loadPerformanceData,
  clearPerformanceData,
  checkPerformanceAlerts,
  configurePerformanceMonitoring,
  PerformanceConfig,
} from '../utils/performance';

interface AggregatedPerformanceData {
  appMetrics: {
    averageStartupTime: number;
    averageFPS: number;
    averageMemoryUsage: number;
    totalMeasurements: number;
  };
  navigationMetrics: {
    averageScreenTransition: number;
    averageDrawerOpen: number;
    averageDrawerClose: number;
    averageFooterNavigation: number;
    averageLazyLoad: number;
    totalNavigations: number;
  };
  componentMetrics: {
    totalComponents: number;
    averageRenderTime: number;
    componentsWithMemoryLeaks: number;
    totalRenders: number;
  };
  modalMetrics: {
    averageModalOpen: number;
    averageModalClose: number;
    averageGestureResponse: number;
    totalModals: number;
  };
  alerts: string[];
  lastUpdated: number;
}

interface PerformanceContextType {
  isEnabled: boolean;
  config: PerformanceConfig;
  aggregatedData: AggregatedPerformanceData;
  allMetrics: PerformanceMetrics[];
  alerts: string[];
  configure: (config: Partial<PerformanceConfig>) => void;
  refreshData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<PerformanceMetrics[]>;
  getRealTimeMetrics: () => PerformanceMetrics | null;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(
  undefined,
);

interface PerformanceProviderProps {
  children: ReactNode;
  initialConfig?: Partial<PerformanceConfig>;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  initialConfig,
}) => {
  const [isEnabled, setIsEnabled] = useState(isPerformanceMonitoringEnabled());
  const [config, setConfig] = useState({
    ...require('../utils/performance').defaultPerformanceConfig,
    ...initialConfig,
  });
  const [aggregatedData, setAggregatedData] =
    useState<AggregatedPerformanceData>({
      appMetrics: {
        averageStartupTime: 0,
        averageFPS: 60,
        averageMemoryUsage: 0,
        totalMeasurements: 0,
      },
      navigationMetrics: {
        averageScreenTransition: 0,
        averageDrawerOpen: 0,
        averageDrawerClose: 0,
        averageFooterNavigation: 0,
        averageLazyLoad: 0,
        totalNavigations: 0,
      },
      componentMetrics: {
        totalComponents: 0,
        averageRenderTime: 0,
        componentsWithMemoryLeaks: 0,
        totalRenders: 0,
      },
      modalMetrics: {
        averageModalOpen: 0,
        averageModalClose: 0,
        averageGestureResponse: 0,
        totalModals: 0,
      },
      alerts: [],
      lastUpdated: Date.now(),
    });
  const [allMetrics, setAllMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] =
    useState<PerformanceMetrics | null>(null);

  // Configure performance monitoring
  const configure = useCallback(
    (newConfig: Partial<PerformanceConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
      configurePerformanceMonitoring(updatedConfig);
      setIsEnabled(updatedConfig.enabled);
    },
    [config],
  );

  // Aggregate performance data
  const aggregateData = useCallback(
    (metrics: PerformanceMetrics[]): AggregatedPerformanceData => {
      const appMetrics = metrics.filter(
        m => m.appStartupTime || m.fps || m.memoryUsage,
      );
      const navigationMetrics = metrics.filter(
        m =>
          m.screenTransitionTime ||
          m.drawerOpenTime ||
          m.drawerCloseTime ||
          m.footerNavigationTime ||
          m.lazyLoadTime,
      );
      const componentMetrics = metrics.filter(
        m => (m as any).componentName && m.componentRenderTime,
      );
      const modalMetrics = metrics.filter(
        m =>
          (m as any).modalName &&
          (m.modalOpenTime || m.modalCloseTime || m.gestureResponseTime),
      );

      const aggregated: AggregatedPerformanceData = {
        appMetrics: {
          averageStartupTime:
            appMetrics.length > 0
              ? appMetrics
                  .filter(m => m.appStartupTime)
                  .reduce((sum, m) => sum + (m.appStartupTime || 0), 0) /
                appMetrics.filter(m => m.appStartupTime).length
              : 0,
          averageFPS:
            appMetrics.length > 0
              ? appMetrics
                  .filter(m => m.fps)
                  .reduce((sum, m) => sum + (m.fps || 60), 0) /
                appMetrics.filter(m => m.fps).length
              : 60,
          averageMemoryUsage:
            appMetrics.length > 0
              ? appMetrics
                  .filter(m => m.memoryUsage)
                  .reduce((sum, m) => sum + (m.memoryUsage || 0), 0) /
                appMetrics.filter(m => m.memoryUsage).length
              : 0,
          totalMeasurements: appMetrics.length,
        },
        navigationMetrics: {
          averageScreenTransition:
            navigationMetrics.length > 0
              ? navigationMetrics
                  .filter(m => m.screenTransitionTime)
                  .reduce((sum, m) => sum + (m.screenTransitionTime || 0), 0) /
                navigationMetrics.filter(m => m.screenTransitionTime).length
              : 0,
          averageDrawerOpen:
            navigationMetrics.length > 0
              ? navigationMetrics
                  .filter(m => m.drawerOpenTime)
                  .reduce((sum, m) => sum + (m.drawerOpenTime || 0), 0) /
                navigationMetrics.filter(m => m.drawerOpenTime).length
              : 0,
          averageDrawerClose:
            navigationMetrics.length > 0
              ? navigationMetrics
                  .filter(m => m.drawerCloseTime)
                  .reduce((sum, m) => sum + (m.drawerCloseTime || 0), 0) /
                navigationMetrics.filter(m => m.drawerCloseTime).length
              : 0,
          averageFooterNavigation:
            navigationMetrics.length > 0
              ? navigationMetrics
                  .filter(m => m.footerNavigationTime)
                  .reduce((sum, m) => sum + (m.footerNavigationTime || 0), 0) /
                navigationMetrics.filter(m => m.footerNavigationTime).length
              : 0,
          averageLazyLoad:
            navigationMetrics.length > 0
              ? navigationMetrics
                  .filter(m => m.lazyLoadTime)
                  .reduce((sum, m) => sum + (m.lazyLoadTime || 0), 0) /
                navigationMetrics.filter(m => m.lazyLoadTime).length
              : 0,
          totalNavigations: navigationMetrics.length,
        },
        componentMetrics: {
          totalComponents: new Set(
            componentMetrics.map(m => (m as any).componentName),
          ).size,
          averageRenderTime:
            componentMetrics.length > 0
              ? componentMetrics.reduce(
                  (sum, m) => sum + (m.componentRenderTime || 0),
                  0,
                ) / componentMetrics.length
              : 0,
          componentsWithMemoryLeaks: componentMetrics.filter(
            m =>
              (m as any).memoryLeakIndicators &&
              (m as any).memoryLeakIndicators > 0,
          ).length,
          totalRenders: componentMetrics.length,
        },
        modalMetrics: {
          averageModalOpen:
            modalMetrics.length > 0
              ? modalMetrics
                  .filter(m => m.modalOpenTime)
                  .reduce((sum, m) => sum + (m.modalOpenTime || 0), 0) /
                modalMetrics.filter(m => m.modalOpenTime).length
              : 0,
          averageModalClose:
            modalMetrics.length > 0
              ? modalMetrics
                  .filter(m => m.modalCloseTime)
                  .reduce((sum, m) => sum + (m.modalCloseTime || 0), 0) /
                modalMetrics.filter(m => m.modalCloseTime).length
              : 0,
          averageGestureResponse:
            modalMetrics.length > 0
              ? modalMetrics
                  .filter(m => m.gestureResponseTime)
                  .reduce((sum, m) => sum + (m.gestureResponseTime || 0), 0) /
                modalMetrics.filter(m => m.gestureResponseTime).length
              : 0,
          totalModals: modalMetrics.length,
        },
        alerts: [],
        lastUpdated: Date.now(),
      };

      // Generate alerts
      const allAlerts: string[] = [];
      metrics.forEach(metric => {
        allAlerts.push(...checkPerformanceAlerts(metric));
      });
      aggregated.alerts = [...new Set(allAlerts)]; // Remove duplicates

      return aggregated;
    },
    [],
  );

  // Refresh data from storage
  const refreshData = useCallback(async () => {
    if (!isEnabled) return;

    try {
      const metrics = await loadPerformanceData();
      setAllMetrics(metrics);
      const aggregated = aggregateData(metrics);
      setAggregatedData(aggregated);
      setAlerts(aggregated.alerts);
    } catch (error) {
      console.warn('Failed to refresh performance data:', error);
    }
  }, [isEnabled, aggregateData]);

  // Clear all data
  const clearAllData = useCallback(async () => {
    await clearPerformanceData();
    setAllMetrics([]);
    setAggregatedData({
      appMetrics: {
        averageStartupTime: 0,
        averageFPS: 60,
        averageMemoryUsage: 0,
        totalMeasurements: 0,
      },
      navigationMetrics: {
        averageScreenTransition: 0,
        averageDrawerOpen: 0,
        averageDrawerClose: 0,
        averageFooterNavigation: 0,
        averageLazyLoad: 0,
        totalNavigations: 0,
      },
      componentMetrics: {
        totalComponents: 0,
        averageRenderTime: 0,
        componentsWithMemoryLeaks: 0,
        totalRenders: 0,
      },
      modalMetrics: {
        averageModalOpen: 0,
        averageModalClose: 0,
        averageGestureResponse: 0,
        totalModals: 0,
      },
      alerts: [],
      lastUpdated: Date.now(),
    });
    setAlerts([]);
  }, []);

  // Export data
  const exportData = useCallback(async (): Promise<PerformanceMetrics[]> => {
    return await loadPerformanceData();
  }, []);

  // Get real-time metrics
  const getRealTimeMetrics = useCallback((): PerformanceMetrics | null => {
    return realTimeMetrics;
  }, [realTimeMetrics]);

  // Initialize and refresh data periodically
  useEffect(() => {
    if (isEnabled) {
      refreshData();
      const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isEnabled, refreshData]);

  // Apply initial config
  useEffect(() => {
    if (initialConfig) {
      configure(initialConfig);
    }
  }, [initialConfig, configure]);

  const contextValue: PerformanceContextType = {
    isEnabled,
    config,
    aggregatedData,
    allMetrics,
    alerts,
    configure,
    refreshData,
    clearAllData,
    exportData,
    getRealTimeMetrics,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error(
      'usePerformanceContext must be used within a PerformanceProvider',
    );
  }
  return context;
};
