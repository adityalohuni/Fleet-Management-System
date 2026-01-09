import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AssignmentService } from '../services/assignment.service';
import { QUERY_KEYS } from './query-keys';
import { Assignment } from '../types';

export const useAssignments = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSIGNMENTS],
    queryFn: AssignmentService.getAll,
  });
};

export const useAssignmentsByVehicle = (vehicleId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSIGNMENTS, vehicleId],
    queryFn: () => AssignmentService.getByVehicleId(vehicleId),
    enabled: !!vehicleId,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AssignmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] });
    },
  });
};

export const useUpdateAssignmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Assignment['status'] }) =>
      AssignmentService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] });
    },
  });
};
