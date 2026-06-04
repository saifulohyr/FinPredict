import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface UserSettings {
  ai_enabled: boolean;
  notif_high_spending: boolean;
  notif_low_balance: boolean;
}

export const useSettings = () => {
  const queryClient = useQueryClient();

  const useSettingsQuery = () => useQuery<UserSettings>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const { data } = await api.get('/auth/settings');
      return data.data;
    },
  });

  const useUpdateSettingsMutation = () => useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      const { data } = await api.put('/auth/settings', settings);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });

  return {
    useSettingsQuery,
    useUpdateSettingsMutation,
  };
};
