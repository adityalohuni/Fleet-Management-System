import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboard.service';
import { QUERY_KEYS } from './query-keys';

export const useDashboardMetrics = (autoRefresh: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
    queryFn: DashboardService.getMetrics,
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds if enabled
  });
};

export const useDashboardUtilization = (autoRefresh: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_UTILIZATION],
    queryFn: DashboardService.getUtilization,
    refetchInterval: autoRefresh ? 30000 : false,
  });
};

export const useDashboardRecentAssignments = (autoRefresh: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_RECENT_ASSIGNMENTS],
    queryFn: DashboardService.getRecentAssignments,
    refetchInterval: autoRefresh ? 30000 : false,
  });
};

export const useDashboardAlerts = (autoRefresh: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_ALERTS],
    queryFn: DashboardService.getAlerts,
    refetchInterval: autoRefresh ? 30000 : false,
  });
};
