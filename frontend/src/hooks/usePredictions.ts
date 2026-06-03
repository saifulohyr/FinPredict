import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const usePredictions = () => {
  const queryClient = useQueryClient();

  const usePredictionsQuery = () => useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const { data } = await api.get('/predictions');
      // Backend returns { predictions, lastGeneratedAt }
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

  const useAiAnalysisResultQuery = () => useQuery({
    queryKey: ['aiAnalysisResult'],
    queryFn: async () => {
      const { data } = await api.get('/predictions/ai-result');
      // Returns: { ai_status, risk_probability, rekomendasi, model_digunakan, generated_at } or null
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
      queryClient.invalidateQueries({ queryKey: ['aiAnalysisResult'] });
    },
  });

  return {
    usePredictionsQuery,
    useWarningStatusQuery,
    useAiAnalysisResultQuery,
    useGeneratePredictionMutation,
  };
};
