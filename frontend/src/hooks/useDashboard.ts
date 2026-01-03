import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboard.service';
import { QUERY_KEYS } from './query-keys';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
    queryFn: DashboardService.getMetrics,
  });
};

export const useDashboardUtilization = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_UTILIZATION],
    queryFn: DashboardService.getUtilization,
  });
};

export const useDashboardRecentAssignments = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_RECENT_ASSIGNMENTS],
    queryFn: DashboardService.getRecentAssignments,
  });
};

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_ALERTS],
    queryFn: DashboardService.getAlerts,
  });
};
