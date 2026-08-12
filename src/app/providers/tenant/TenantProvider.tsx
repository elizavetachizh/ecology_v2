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
import {
  clearActiveTenantId,
  readActiveTenantId,
  writeActiveTenantId,
} from "../../../shared/auth/active-tenant-storage";
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

function isKnownTenant(flatTenants: Tenant[], tenantId: string | null) {
  return Boolean(
    tenantId && flatTenants.some((tenant) => tenant.id === tenantId),
  );
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
  const realm = userQuery.data?.realm ?? null;

  const resolvedTenantId = isKnownTenant(flatTenants, activeTenantId)
    ? activeTenantId
    : flatTenants.length === 1
      ? flatTenants[0]!.id
      : null;

  // Hydrate из sessionStorage после /me + /tenants (realm уже известен).
  useEffect(() => {
    if (!realm || tenantsQuery.data === undefined) return;

    if (isKnownTenant(flatTenants, activeTenantId)) return;

    const storedId = readActiveTenantId(realm);
    if (isKnownTenant(flatTenants, storedId)) {
      setActiveTenantId(storedId);
      return;
    }

    if (storedId) {
      clearActiveTenantId(realm);
    }

    if (flatTenants.length === 1) {
      setActiveTenantId(flatTenants[0]!.id);
    }
  }, [realm, tenantsQuery.data, flatTenants, activeTenantId]);

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
