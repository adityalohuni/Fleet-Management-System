import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DriverService } from '../services/driver.service';
import { QUERY_KEYS } from './query-keys';
import { Driver } from '../types';

export const useDrivers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DRIVERS],
    queryFn: DriverService.getAll,
  });
};

export const useDriver = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.DRIVER(id),
    queryFn: () => DriverService.getById(id),
    enabled: !!id,
  });
};

export const useDriverAssignments = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.DRIVER_ASSIGNMENTS(id),
    queryFn: () => DriverService.getAssignmentHistory(id),
    enabled: !!id,
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DriverService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS] });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Driver> }) =>
      DriverService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRIVER(data.id) });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DriverService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS] });
    },
  });
};
