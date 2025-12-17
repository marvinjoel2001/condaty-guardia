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

interface ModalPerformanceMetrics extends PerformanceMetrics {
  modalName: string;
  modalOpenTime?: number;
  modalCloseTime?: number;
  gestureResponseTime?: number;
  accessibilityActivationTime?: number;
  memoryUsageDuringModal?: number;
  modalType: 'full' | 'dynamic' | 'image' | 'standard';
}

interface UseModalPerformanceMonitorOptions {
  modalName: string;
  modalType?: ModalPerformanceMetrics['modalType'];
  trackGestures?: boolean;
  trackAccessibility?: boolean;
  trackMemory?: boolean;
  onMetricsUpdate?: (metrics: ModalPerformanceMetrics) => void;
  onAlert?: (alerts: string[]) => void;
}

export const useModalPerformanceMonitor = ({
  modalName,
  modalType = 'standard',
  trackGestures = true,
  trackAccessibility = true,
  trackMemory = true,
  onMetricsUpdate,
  onAlert,
}: UseModalPerformanceMonitorOptions) => {
  const modalStartRef = useRef<{ [key: string]: number }>({});
  const gestureStartRef = useRef<number | null>(null);
  const accessibilityStartRef = useRef<number | null>(null);

  const startModalOpenTracking = useCallback(() => {
    if (!isPerformanceMonitoringEnabled()) return;

    const key = `modal-open-${Date.now()}`;
    modalStartRef.current[key] = performance.now();

    createPerformanceMark(`${modalName}-open-start`);

    return () => endModalOpenTracking(key);
  }, [modalName]);

  const endModalOpenTracking = useCallback(
    async (key: string) => {
      if (!isPerformanceMonitoringEnabled() || !modalStartRef.current[key])
        return;

      const openTime = performance.now() - modalStartRef.current[key];
      createPerformanceMark(`${modalName}-open-end`);

      const metrics: ModalPerformanceMetrics = {
        timestamp: Date.now(),
        modalName,
        modalType,
        modalOpenTime: openTime,
      };

      onMetricsUpdate?.(metrics);

      // Check for alerts
      const alerts = checkPerformanceAlerts(metrics);
      if (alerts.length > 0) {
        onAlert?.(alerts);
      }

      // Save to persistent storage
      const existingData = await loadPerformanceData();
      existingData.push(metrics);
      await savePerformanceData(existingData.slice(-100)); // Keep last 100 modal events

      console.log(`Modal ${modalName} opened in ${openTime.toFixed(2)}ms`);
      delete modalStartRef.current[key];
    },
    [modalName, modalType, onMetricsUpdate, onAlert],
  );

  const startModalCloseTracking = useCallback(() => {
    if (!isPerformanceMonitoringEnabled()) return;

    const key = `modal-close-${Date.now()}`;
    modalStartRef.current[key] = performance.now();

    createPerformanceMark(`${modalName}-close-start`);

    return () => endModalCloseTracking(key);
  }, [modalName]);

  const endModalCloseTracking = useCallback(
    async (key: string) => {
      if (!isPerformanceMonitoringEnabled() || !modalStartRef.current[key])
        return;

      const closeTime = performance.now() - modalStartRef.current[key];
      createPerformanceMark(`${modalName}-close-end`);

      const metrics: ModalPerformanceMetrics = {
        timestamp: Date.now(),
        modalName,
        modalType,
        modalCloseTime: closeTime,
      };

      onMetricsUpdate?.(metrics);

      // Check for alerts
      const alerts = checkPerformanceAlerts(metrics);
      if (alerts.length > 0) {
        onAlert?.(alerts);
      }

      // Save to persistent storage
      const existingData = await loadPerformanceData();
      existingData.push(metrics);
      await savePerformanceData(existingData.slice(-100));

      console.log(`Modal ${modalName} closed in ${closeTime.toFixed(2)}ms`);
      delete modalStartRef.current[key];
    },
    [modalName, modalType, onMetricsUpdate, onAlert],
  );

  const trackGestureResponse = useCallback(() => {
    if (!isPerformanceMonitoringEnabled() || !trackGestures) return;

    gestureStartRef.current = performance.now();
    createPerformanceMark(`${modalName}-gesture-start`);

    return () => endGestureTracking();
  }, [modalName, trackGestures]);

  const endGestureTracking = useCallback(async () => {
    if (!gestureStartRef.current || !trackGestures) return;

    const gestureTime = performance.now() - gestureStartRef.current;
    createPerformanceMark(`${modalName}-gesture-end`);

    const metrics: ModalPerformanceMetrics = {
      timestamp: Date.now(),
      modalName,
      modalType,
      gestureResponseTime: gestureTime,
    };

    onMetricsUpdate?.(metrics);

    // Check for alerts
    const alerts = checkPerformanceAlerts(metrics);
    if (alerts.length > 0) {
      onAlert?.(alerts);
    }

    // Save to persistent storage
    const existingData = await loadPerformanceData();
    existingData.push(metrics);
    await savePerformanceData(existingData.slice(-100));

    console.log(
      `Modal ${modalName} gesture responded in ${gestureTime.toFixed(2)}ms`,
    );
    gestureStartRef.current = null;
  }, [modalName, modalType, trackGestures, onMetricsUpdate, onAlert]);

  const trackAccessibilityActivation = useCallback(() => {
    if (!isPerformanceMonitoringEnabled() || !trackAccessibility) return;

    accessibilityStartRef.current = performance.now();
    createPerformanceMark(`${modalName}-accessibility-start`);

    return () => endAccessibilityTracking();
  }, [modalName, trackAccessibility]);

  const endAccessibilityTracking = useCallback(async () => {
    if (!accessibilityStartRef.current || !trackAccessibility) return;

    const accessibilityTime = performance.now() - accessibilityStartRef.current;
    createPerformanceMark(`${modalName}-accessibility-end`);

    const metrics: ModalPerformanceMetrics = {
      timestamp: Date.now(),
      modalName,
      modalType,
      accessibilityActivationTime: accessibilityTime,
    };

    onMetricsUpdate?.(metrics);

    // Check for alerts
    const alerts = checkPerformanceAlerts(metrics);
    if (alerts.length > 0) {
      onAlert?.(alerts);
    }

    // Save to persistent storage
    const existingData = await loadPerformanceData();
    existingData.push(metrics);
    await savePerformanceData(existingData.slice(-100));

    console.log(
      `Modal ${modalName} accessibility activated in ${accessibilityTime.toFixed(
        2,
      )}ms`,
    );
    accessibilityStartRef.current = null;
  }, [modalName, modalType, trackAccessibility, onMetricsUpdate, onAlert]);

  const trackModalMemoryUsage = useCallback(
    async (memoryUsage: number) => {
      if (!isPerformanceMonitoringEnabled() || !trackMemory) return;

      const metrics: ModalPerformanceMetrics = {
        timestamp: Date.now(),
        modalName,
        modalType,
        memoryUsageDuringModal: memoryUsage,
      };

      onMetricsUpdate?.(metrics);

      // Check for alerts
      const alerts = checkPerformanceAlerts(metrics);
      if (alerts.length > 0) {
        onAlert?.(alerts);
      }

      // Save to persistent storage
      const existingData = await loadPerformanceData();
      existingData.push(metrics);
      await savePerformanceData(existingData.slice(-100));

      console.log(
        `Modal ${modalName} memory usage: ${(memoryUsage / 1024 / 1024).toFixed(
          2,
        )}MB`,
      );
    },
    [modalName, modalType, trackMemory, onMetricsUpdate, onAlert],
  );

  const exportModalMetrics = useCallback(async (): Promise<
    ModalPerformanceMetrics[]
  > => {
    const data = await loadPerformanceData();
    return data.filter(
      item => (item as ModalPerformanceMetrics).modalName === modalName,
    ) as ModalPerformanceMetrics[];
  }, [modalName]);

  const getModalStats = useCallback(async () => {
    const modalMetrics = await exportModalMetrics();

    const stats = {
      totalOpens: 0,
      totalCloses: 0,
      averageOpenTime: 0,
      averageCloseTime: 0,
      averageGestureTime: 0,
      averageAccessibilityTime: 0,
      maxOpenTime: 0,
      maxCloseTime: 0,
      maxGestureTime: 0,
      maxAccessibilityTime: 0,
    };

    const openTimes = modalMetrics
      .filter(m => m.modalOpenTime)
      .map(m => m.modalOpenTime!);
    const closeTimes = modalMetrics
      .filter(m => m.modalCloseTime)
      .map(m => m.modalCloseTime!);
    const gestureTimes = modalMetrics
      .filter(m => m.gestureResponseTime)
      .map(m => m.gestureResponseTime!);
    const accessibilityTimes = modalMetrics
      .filter(m => m.accessibilityActivationTime)
      .map(m => m.accessibilityActivationTime!);

    stats.totalOpens = openTimes.length;
    stats.totalCloses = closeTimes.length;

    if (openTimes.length > 0) {
      stats.averageOpenTime =
        openTimes.reduce((a, b) => a + b, 0) / openTimes.length;
      stats.maxOpenTime = Math.max(...openTimes);
    }

    if (closeTimes.length > 0) {
      stats.averageCloseTime =
        closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length;
      stats.maxCloseTime = Math.max(...closeTimes);
    }

    if (gestureTimes.length > 0) {
      stats.averageGestureTime =
        gestureTimes.reduce((a, b) => a + b, 0) / gestureTimes.length;
      stats.maxGestureTime = Math.max(...gestureTimes);
    }

    if (accessibilityTimes.length > 0) {
      stats.averageAccessibilityTime =
        accessibilityTimes.reduce((a, b) => a + b, 0) /
        accessibilityTimes.length;
      stats.maxAccessibilityTime = Math.max(...accessibilityTimes);
    }

    return stats;
  }, [exportModalMetrics]);

  return {
    startModalOpenTracking,
    endModalOpenTracking,
    startModalCloseTracking,
    endModalCloseTracking,
    trackGestureResponse,
    endGestureTracking,
    trackAccessibilityActivation,
    endAccessibilityTracking,
    trackModalMemoryUsage,
    exportModalMetrics,
    getModalStats,
  };
};
