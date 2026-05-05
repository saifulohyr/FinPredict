import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function TestConnection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await api.get('/health');
      return response.data;
    },
  });

  if (isLoading) return <p className="text-slate-500">Connecting to API...</p>;
  if (error) return <p className="text-red-500">Connection Failed: {(error as any).message}</p>;

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
      <p className="font-bold">✅ Backend Connected!</p>
      <pre className="text-xs mt-2">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
