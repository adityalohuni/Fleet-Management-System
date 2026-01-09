import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceService } from '../services/maintenance.service';
import { MaintenanceRecord, Alert } from '../types';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: MaintenanceService.getAlerts,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MaintenanceService.createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MaintenanceService.resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useMaintenanceRecords(vehicleId: string) {
  return useQuery({
    queryKey: ['maintenance-records', vehicleId],
    queryFn: () => MaintenanceService.getRecordsByVehicle(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useCreateMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MaintenanceService.createRecord,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
