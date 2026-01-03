import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from './query-keys';
import { ServicesService } from '../services/services.service';

export const useServices = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES],
    queryFn: ServicesService.getAll,
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.SERVICE(id),
    queryFn: () => ServicesService.getById(id),
    enabled: !!id,
  });
};
