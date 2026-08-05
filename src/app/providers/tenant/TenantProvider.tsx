import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getTenants, type Tenant } from "../../../entities/tenant";
import { getCurrentUser } from "../../../entities/user";
import { setTenantIdResolver } from "../../../shared/api/api-client";
import { Button } from "../../../shared/ui";
import { TenantContext } from "./tenant-context";

type TenantProviderProps = {
  children: ReactNode;
  onTenantChange: () => void | Promise<void>;
};

function flattenTenants(tenants: Tenant[]): Tenant[] {
  return tenants.flatMap((tenant) => [
    tenant,
    ...flattenTenants(tenant.children ?? []),
  ]);
}

export function TenantProvider({
  children,
  onTenantChange,
}: TenantProviderProps) {
  const queryClient = useQueryClient();
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: ({ signal }) => getCurrentUser(signal),
    retry: false,
    staleTime: 60_000,
  });
  const tenantsQuery = useQuery({
    queryKey: ["auth", "tenants"],
    queryFn: ({ signal }) => getTenants(signal),
    retry: false,
    staleTime: 60_000,
  });

  const flatTenants = useMemo(
    () => flattenTenants(tenantsQuery.data ?? []),
    [tenantsQuery.data],
  );
  const resolvedTenantId = flatTenants.some(
    (tenant) => tenant.id === activeTenantId,
  )
    ? activeTenantId
    : flatTenants.length === 1
      ? flatTenants[0]!.id
      : null;

  useEffect(() => {
    setTenantIdResolver(() => resolvedTenantId);
    return () => setTenantIdResolver(() => null);
  }, [resolvedTenantId]);

  const selectTenant = useCallback(
    async (tenantId: string) => {
      if (tenantId === resolvedTenantId) return;
      if (!flatTenants.some((tenant) => tenant.id === tenantId)) {
        throw new Error("Выбранный tenant недоступен пользователю");
      }

      await queryClient.cancelQueries({
        predicate: (query) => query.meta?.tenantScoped === true,
      });
      queryClient.removeQueries({
        predicate: (query) => query.meta?.tenantScoped === true,
      });
      await onTenantChange();
      setActiveTenantId(tenantId);
    },
    [flatTenants, onTenantChange, queryClient, resolvedTenantId],
  );

  if (userQuery.isPending || tenantsQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Загрузка профиля и организаций…
        </p>
      </div>
    );
  }

  const queryError = userQuery.error ?? tenantsQuery.error;
  if (queryError || !userQuery.data || !tenantsQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <h1 className="font-semibold">Не удалось загрузить профиль</h1>
          <p className="text-sm text-muted-foreground">
            {queryError instanceof Error
              ? queryError.message
              : "Сервер вернул некорректный ответ"}
          </p>
          <Button
            onClick={() => {
              void userQuery.refetch();
              void tenantsQuery.refetch();
            }}
          >
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  const activeTenant =
    flatTenants.find((tenant) => tenant.id === resolvedTenantId) ?? null;
  const value = {
    user: userQuery.data,
    tenants: tenantsQuery.data,
    flatTenants,
    activeTenantId: resolvedTenantId,
    activeTenant,
    selectTenant,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
