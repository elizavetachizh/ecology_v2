import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getTenants,
  TenantContext,
  type Tenant,
} from "../../../entities/tenant";
import { getCurrentUser } from "../../../entities/user";
import { setTenantIdResolver } from "../../../shared/api/api-client";
import {
  clearActiveTenantId,
  readActiveTenantId,
  writeActiveTenantId,
} from "../../../shared/auth/active-tenant-storage";
import { Button } from "../../../shared/ui";
import { DEFAULT_STALE_TIME_MS } from "../../../shared/lib/query-client";

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

function isKnownTenant(flatTenants: Tenant[], tenantId: string | null) {
  return Boolean(
    tenantId && flatTenants.some((tenant) => tenant.id === tenantId),
  );
}

function resolveActiveTenantId(
  flatTenants: Tenant[],
  selectedId: string | null,
  storedId: string | null,
): string | null {
  if (isKnownTenant(flatTenants, selectedId)) return selectedId;
  if (isKnownTenant(flatTenants, storedId)) return storedId;
  if (flatTenants.length === 1) return flatTenants[0]!.id;
  return null;
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
    staleTime: DEFAULT_STALE_TIME_MS,
  });
  const tenantsQuery = useQuery({
    queryKey: ["auth", "tenants"],
    queryFn: ({ signal }) => getTenants(signal),
    retry: false,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  const flatTenants = useMemo(
    () => flattenTenants(tenantsQuery.data ?? []),
    [tenantsQuery.data],
  );
  const realm = userQuery.data?.realm ?? null;
  const storedId = realm ? readActiveTenantId(realm) : null;
  const resolvedTenantId = resolveActiveTenantId(
    flatTenants,
    activeTenantId,
    storedId,
  );

  // Стереть из storage id, которого больше нет в списке. Без setState.
  useEffect(() => {
    if (!realm || tenantsQuery.data === undefined) return;
    if (storedId && !isKnownTenant(flatTenants, storedId)) {
      clearActiveTenantId(realm);
    }
  }, [realm, tenantsQuery.data, flatTenants, storedId]);

  // Persist валидный resolved id (включая auto-select единственного tenant).
  useEffect(() => {
    if (!realm) return;
    if (resolvedTenantId) {
      writeActiveTenantId(realm, resolvedTenantId);
    }
  }, [realm, resolvedTenantId]);

  useEffect(() => {
    setTenantIdResolver(() => resolvedTenantId);
    return () => setTenantIdResolver(() => null);
  }, [resolvedTenantId]);

  const selectTenant = useCallback(
    async (tenantId: string) => {
      if (tenantId === resolvedTenantId) return;
      if (!isKnownTenant(flatTenants, tenantId)) {
        throw new Error("Выбранный tenant недоступен пользователю");
      }
      if (!realm) {
        throw new Error("Realm пользователя ещё не загружен");
      }

      // Wipe all MDM cache; keys are ["mdm", …]. api-client `tenantScoped` ≠ query.meta.
      await queryClient.cancelQueries({ queryKey: ["mdm"] });
      queryClient.removeQueries({ queryKey: ["mdm"] });
      await onTenantChange();
      writeActiveTenantId(realm, tenantId);
      setActiveTenantId(tenantId);
    },
    [flatTenants, onTenantChange, queryClient, realm, resolvedTenantId],
  );

  const value = useMemo(() => {
    if (!userQuery.data || !tenantsQuery.data) return null;
    return {
      user: userQuery.data,
      tenants: tenantsQuery.data,
      flatTenants,
      activeTenantId: resolvedTenantId,
      activeTenant:
        flatTenants.find((tenant) => tenant.id === resolvedTenantId) ?? null,
      selectTenant,
    };
  }, [
    userQuery.data,
    tenantsQuery.data,
    flatTenants,
    resolvedTenantId,
    selectTenant,
  ]);

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
  if (queryError || !value) {
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

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
