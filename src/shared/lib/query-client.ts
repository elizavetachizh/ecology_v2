import { QueryClient } from "@tanstack/react-query";

export const DEFAULT_STALE_TIME_MS = 60_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
