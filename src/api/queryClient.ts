import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sin reintento en 4xx; un reintento en red/5xx
      retry: (count, err) => {
        if (err instanceof ApiError && err.status >= 400 && err.status < 500) return false;
        return count < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});
