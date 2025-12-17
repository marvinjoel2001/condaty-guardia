import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { usePerformanceContext } from '../../../mk/contexts/PerformanceContext';
import Card from '../../../mk/components/ui/Card/Card';
import ProgressBar from '../../../mk/components/ui/ProgressBar/ProgressBar';
import { cssVar } from '../../../mk/styles/themes';

const PerformanceDashboard = () => {
  const {
    isEnabled,
    aggregatedData,
    alerts,
    refreshData,
    clearAllData,
    exportData,
    configure,
  } = usePerformanceContext();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  }, [refreshData]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear Performance Data',
      'Are you sure you want to clear all performance data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearAllData,
        },
      ],
    );
  }, [clearAllData]);

  const handleExportData = useCallback(async () => {
    try {
      const data = await exportData();
      const jsonData = JSON.stringify(data, null, 2);
      await Share.share({
        message: jsonData,
        title: 'Performance Data Export',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export performance data');
    }
  }, [exportData]);

  const handleToggleMonitoring = useCallback(() => {
    configure({ enabled: !isEnabled });
  }, [configure, isEnabled]);

  if (!isEnabled) {
    return (
      <View style={styles.container}>
        <Card>
          <Text style={styles.title}>Performance Monitoring Disabled</Text>
          <Text style={styles.description}>
            Performance monitoring is currently disabled. Enable it to view
            metrics and track app performance.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleToggleMonitoring}
          >
            <Text style={styles.buttonText}>Enable Monitoring</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Performance Dashboard</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Text style={styles.smallButtonText}>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleToggleMonitoring}
          >
            <Text style={styles.smallButtonText}>Disable</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Performance Alerts</Text>
          {alerts.map((alert, index) => (
            <Text key={index} style={styles.alertText}>
              ⚠️ {alert}
            </Text>
          ))}
        </Card>
      )}

      {/* App Performance */}
      <Card>
        <Text style={styles.sectionTitle}>App Performance</Text>
        <MetricItem
          label="Average Startup Time"
          value={`${aggregatedData.appMetrics.averageStartupTime.toFixed(0)}ms`}
          target="≤ 2000ms"
          progress={Math.min(
            aggregatedData.appMetrics.averageStartupTime / 2000,
            1,
          )}
        />
        <MetricItem
          label="Average FPS"
          value={`${aggregatedData.appMetrics.averageFPS.toFixed(1)}`}
          target="≥ 50"
          progress={Math.min(aggregatedData.appMetrics.averageFPS / 60, 1)}
          isHigherBetter
        />
        <MetricItem
          label="Average Memory Usage"
          value={
            aggregatedData.appMetrics.averageMemoryUsage > 0
              ? `${(
                  aggregatedData.appMetrics.averageMemoryUsage /
                  1024 /
                  1024
                ).toFixed(1)}MB`
              : 'N/A'
          }
          target="≤ 100MB"
          progress={
            aggregatedData.appMetrics.averageMemoryUsage > 0
              ? Math.min(
                  aggregatedData.appMetrics.averageMemoryUsage /
                    (100 * 1024 * 1024),
                  1,
                )
              : 0
          }
        />
        <Text style={styles.metricText}>
          Total Measurements: {aggregatedData.appMetrics.totalMeasurements}
        </Text>
      </Card>

      {/* Navigation Performance */}
      <Card>
        <Text style={styles.sectionTitle}>Navigation Performance</Text>
        <MetricItem
          label="Screen Transitions"
          value={`${aggregatedData.navigationMetrics.averageScreenTransition.toFixed(
            0,
          )}ms`}
          target="≤ 200ms"
          progress={Math.min(
            aggregatedData.navigationMetrics.averageScreenTransition / 200,
            1,
          )}
        />
        <MetricItem
          label="Drawer Open"
          value={`${aggregatedData.navigationMetrics.averageDrawerOpen.toFixed(
            0,
          )}ms`}
          target="≤ 200ms"
          progress={Math.min(
            aggregatedData.navigationMetrics.averageDrawerOpen / 200,
            1,
          )}
        />
        <MetricItem
          label="Drawer Close"
          value={`${aggregatedData.navigationMetrics.averageDrawerClose.toFixed(
            0,
          )}ms`}
          target="≤ 200ms"
          progress={Math.min(
            aggregatedData.navigationMetrics.averageDrawerClose / 200,
            1,
          )}
        />
        <MetricItem
          label="Footer Navigation"
          value={`${aggregatedData.navigationMetrics.averageFooterNavigation.toFixed(
            0,
          )}ms`}
          target="≤ 200ms"
          progress={Math.min(
            aggregatedData.navigationMetrics.averageFooterNavigation / 200,
            1,
          )}
        />
        <MetricItem
          label="Lazy Loading"
          value={`${aggregatedData.navigationMetrics.averageLazyLoad.toFixed(
            0,
          )}ms`}
          target="≤ 500ms"
          progress={Math.min(
            aggregatedData.navigationMetrics.averageLazyLoad / 500,
            1,
          )}
        />
        <Text style={styles.metricText}>
          Total Navigations: {aggregatedData.navigationMetrics.totalNavigations}
        </Text>
      </Card>

      {/* Component Performance */}
      <Card>
        <Text style={styles.sectionTitle}>Component Performance</Text>
        <Text style={styles.metricText}>
          Total Components: {aggregatedData.componentMetrics.totalComponents}
        </Text>
        <Text style={styles.metricText}>
          Average Render Time:{' '}
          {aggregatedData.componentMetrics.averageRenderTime.toFixed(2)}ms
        </Text>
        <Text style={styles.metricText}>
          Components with Memory Leaks:{' '}
          {aggregatedData.componentMetrics.componentsWithMemoryLeaks}
        </Text>
        <Text style={styles.metricText}>
          Total Renders: {aggregatedData.componentMetrics.totalRenders}
        </Text>
      </Card>

      {/* Modal Performance */}
      <Card>
        <Text style={styles.sectionTitle}>Modal Performance</Text>
        <MetricItem
          label="Modal Open Time"
          value={`${aggregatedData.modalMetrics.averageModalOpen.toFixed(0)}ms`}
          target="≤ 150ms"
          progress={Math.min(
            aggregatedData.modalMetrics.averageModalOpen / 150,
            1,
          )}
        />
        <MetricItem
          label="Modal Close Time"
          value={`${aggregatedData.modalMetrics.averageModalClose.toFixed(
            0,
          )}ms`}
          target="≤ 150ms"
          progress={Math.min(
            aggregatedData.modalMetrics.averageModalClose / 150,
            1,
          )}
        />
        <MetricItem
          label="Gesture Response"
          value={`${aggregatedData.modalMetrics.averageGestureResponse.toFixed(
            0,
          )}ms`}
          target="≤ 100ms"
          progress={Math.min(
            aggregatedData.modalMetrics.averageGestureResponse / 100,
            1,
          )}
        />
        <Text style={styles.metricText}>
          Total Modals: {aggregatedData.modalMetrics.totalModals}
        </Text>
      </Card>

      {/* Actions */}
      <Card>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}
          >
            <Text style={styles.buttonText}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Text style={styles.buttonText}>Clear Data</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Text style={styles.lastUpdated}>
        Last updated: {new Date(aggregatedData.lastUpdated).toLocaleString()}
      </Text>
    </ScrollView>
  );
};

interface MetricItemProps {
  label: string;
  value: string;
  target: string;
  progress: number;
  isHigherBetter?: boolean;
}

const MetricItem: React.FC<MetricItemProps> = ({
  label,
  value,
  target,
  progress,
  isHigherBetter = false,
}) => {
  const progressColor = isHigherBetter
    ? progress >= 0.8
      ? '#10b981'
      : progress >= 0.6
      ? '#f59e0b'
      : '#ef4444'
    : progress <= 0.5
    ? '#10b981'
    : progress <= 0.8
    ? '#f59e0b'
    : '#ef4444';

  return (
    <View style={styles.metricItem}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <Text style={styles.metricTarget}>Target: {target}</Text>
      <ProgressBar
        progress={isHigherBetter ? progress : 1 - progress}
        progressColor={progressColor}
        height={8}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: cssVar.cWhite,
    padding: cssVar.spM,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: cssVar.spM,
  },
  title: {
    fontSize: cssVar.sXl,
    fontWeight: 'bold' as const,
    color: cssVar.cBlack,
  },
  headerButtons: {
    flexDirection: 'row' as const,
  },
  smallButton: {
    backgroundColor: cssVar.cPrimary,
    paddingHorizontal: cssVar.spM,
    paddingVertical: cssVar.spS,
    borderRadius: cssVar.bRadiusS,
    marginLeft: cssVar.spS,
  },
  smallButtonText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sS,
  },
  sectionTitle: {
    fontSize: cssVar.sM,
    fontWeight: 'bold' as const,
    color: cssVar.cWhite,
    marginBottom: cssVar.spM,
  },
  alertText: {
    color: cssVar.cError,
    fontSize: cssVar.sS,
    marginBottom: cssVar.spS,
  },
  metricItem: {
    marginBottom: cssVar.spM,
  },
  metricHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  metricLabel: {
    fontSize: cssVar.sM,
    color: cssVar.cWhite,
  },
  metricValue: {
    fontSize: cssVar.sM,
    fontWeight: 'bold' as const,
    color: cssVar.cAccent,
  },
  metricTarget: {
    fontSize: cssVar.sS,
    color: cssVar.cNeutral400,
    marginBottom: cssVar.spS,
  },
  metricText: {
    fontSize: cssVar.sS,
    color: cssVar.cNeutral400,
    marginBottom: cssVar.spS,
  },
  buttonRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  actionButton: {
    backgroundColor: cssVar.cPrimary,
    padding: cssVar.spM,
    borderRadius: cssVar.bRadiusS,
    flex: 1,
    marginHorizontal: cssVar.spS,
    alignItems: 'center' as const,
  },
  dangerButton: {
    backgroundColor: cssVar.cError,
  },
  button: {
    backgroundColor: cssVar.cPrimary,
    padding: cssVar.spM,
    borderRadius: cssVar.bRadiusS,
    alignItems: 'center' as const,
    marginTop: cssVar.spM,
  },
  buttonText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sM,
    fontWeight: 'bold' as const,
  },
  description: {
    fontSize: cssVar.sM,
    color: cssVar.cNeutral400,
    textAlign: 'center' as const,
    marginBottom: cssVar.spM,
  },
  lastUpdated: {
    fontSize: cssVar.sXs,
    color: cssVar.cNeutral400,
    textAlign: 'center' as const,
    marginTop: cssVar.spM,
    marginBottom: cssVar.spL,
  },
};

export default PerformanceDashboard;
