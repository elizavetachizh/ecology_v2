import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "../shared/lib/query-client";
import { AuthProvider } from "./providers/auth/AuthProvider";
import { clearSessionState } from "../shared/auth/cleanup-session";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider onSessionInvalidated={clearSessionState}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
