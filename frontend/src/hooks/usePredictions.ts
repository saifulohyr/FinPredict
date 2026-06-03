import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const usePredictions = () => {
  const queryClient = useQueryClient();

  const usePredictionsQuery = () => useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const { data } = await api.get('/predictions');
      // Backend now returns { predictions, lastGeneratedAt }
      return data.data;
    },
  });

  const useWarningStatusQuery = () => useQuery({
    queryKey: ['warningStatus'],
    queryFn: async () => {
      const { data } = await api.get('/predictions/warning');
      return data.data;
    },
  });

  const useGeneratePredictionMutation = () => useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/predictions/generate');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['warningStatus'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    usePredictionsQuery,
    useWarningStatusQuery,
    useGeneratePredictionMutation,
  };
};
