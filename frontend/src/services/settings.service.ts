import api from './api';
import type { AppSettingsDto, UpdateAppSettingsDto } from '../dto/settings.dto';

export const SettingsService = {
  get: async (): Promise<AppSettingsDto> => {
    const { data } = await api.get<AppSettingsDto>('/settings');
    return data;
  },

  update: async (dto: UpdateAppSettingsDto): Promise<AppSettingsDto> => {
    const { data } = await api.put<AppSettingsDto>('/settings', dto);
    return data;
  },

  listUsers: async () => {
    const { data } = await api.get<Array<{ id: string; email: string; role: string; is_active: boolean }>>('/users');
    return data;
  },

  createUser: async (dto: { email: string; password: string; role: string; is_active: boolean }) => {
    const { data } = await api.post<{ id: string; email: string; role: string; is_active: boolean }>('/users', dto);
    return data;
  },

  updateUser: async (id: string, dto: { role: string; is_active: boolean }) => {
    const { data } = await api.put<{ id: string; email: string; role: string; is_active: boolean }>(`/users/${id}`, dto);
    return data;
  },
};
