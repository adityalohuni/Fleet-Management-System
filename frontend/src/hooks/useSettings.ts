import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '../services/settings.service';
import { useAuth } from '../contexts/AuthContext';
import type { UpdateAppSettingsDto } from '../dto/settings.dto';
import { QUERY_KEYS } from './query-keys';
import { toast } from 'sonner';

export const useAppSettings = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS],
    queryFn: SettingsService.get,
    enabled: isAuthenticated,
    retry: 1,
    meta: {
      errorMessage: 'Failed to load settings'
    }
  });
};

export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateAppSettingsDto) => SettingsService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update settings');
    },
  });
};

export const useUsers = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: SettingsService.listUsers,
    enabled: isAuthenticated,
    retry: 1,
    meta: {
      errorMessage: 'Failed to load users'
    }
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { email: string; password: string; role: string; is_active: boolean }) => SettingsService.createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create user');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { role: string; is_active: boolean } }) => SettingsService.updateUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update user');
    },
  });
};
