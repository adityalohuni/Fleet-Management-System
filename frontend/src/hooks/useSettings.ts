import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '../services/settings.service';
import type { UpdateAppSettingsDto } from '../dto/settings.dto';
import { QUERY_KEYS } from './query-keys';

export const useAppSettings = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS],
    queryFn: SettingsService.get,
  });
};

export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateAppSettingsDto) => SettingsService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: SettingsService.listUsers,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { email: string; password: string; role: string; is_active: boolean }) => SettingsService.createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { role: string; is_active: boolean } }) => SettingsService.updateUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
};
