import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "../shared/lib/query-client";
import { Toaster } from "../shared/ui";
import { AuthProvider } from "./providers/auth/AuthProvider";
import { TenantProvider } from "./providers/tenant/TenantProvider";
import {
  clearSessionState,
  clearTenantState,
} from "../shared/auth/cleanup-session";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider onSessionInvalidated={clearSessionState}>
        <TenantProvider onTenantChange={clearTenantState}>
          {children}
          <Toaster />
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
