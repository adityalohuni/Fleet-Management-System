import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VehicleService } from '../services/vehicle.service';
import { QUERY_KEYS } from './query-keys';
import { Vehicle } from '../types';

export const useVehicles = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.VEHICLES],
    queryFn: VehicleService.getAll,
  });
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VEHICLE(id),
    queryFn: () => VehicleService.getById(id),
    enabled: !!id,
  });
};

export const useVehicleMaintenance = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VEHICLE_MAINTENANCE(id),
    queryFn: () => VehicleService.getMaintenanceHistory(id),
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: VehicleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      VehicleService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLE(data.id) });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: VehicleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES] });
    },
  });
};
