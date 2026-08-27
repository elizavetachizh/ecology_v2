import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  flattenTenants,
  getTenants,
  isKnownTenant,
  resolveActiveTenantId,
  TenantContext,
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
};

async function wipeTenantScopedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.cancelQueries({ queryKey: ["mdm"] });
  queryClient.removeQueries({ queryKey: ["mdm"] });
  await queryClient.cancelQueries({ queryKey: ["operations"] });
  queryClient.removeQueries({ queryKey: ["operations"] });
}

function withTenantSearch<T extends { tenant?: string }>(
  prev: T,
  tenant: string | undefined,
): T {
  return { ...prev, tenant };
}

export function TenantProvider({ children }: TenantProviderProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const tenantFromUrl = useSearch({
    from: "__root__",
    select: (search) => search.tenant ?? null,
  });
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
    tenantFromUrl,
    storedId,
  );

  useLayoutEffect(() => {
    setTenantIdResolver(() => resolvedTenantId);
    return () => setTenantIdResolver(() => null);
  }, [resolvedTenantId]);

  useEffect(() => {
    if (!realm || tenantsQuery.data === undefined) return;

    if (resolvedTenantId) {
      writeActiveTenantId(realm, resolvedTenantId);
    } else if (storedId) {
      clearActiveTenantId(realm);
    }

    if (tenantFromUrl === resolvedTenantId) return;
    void navigate({
      to: ".",
      search: (prev) => withTenantSearch(prev, resolvedTenantId ?? undefined),
      replace: true,
    });
  }, [
    navigate,
    realm,
    resolvedTenantId,
    storedId,
    tenantFromUrl,
    tenantsQuery.data,
  ]);

  const selectTenant = useCallback(
    async (tenantId: string) => {
      if (tenantId === resolvedTenantId) return;
      if (!isKnownTenant(flatTenants, tenantId)) {
        throw new Error("Выбранный tenant недоступен пользователю");
      }
      if (!realm) {
        throw new Error("Realm пользователя ещё не загружен");
      }

      setTenantIdResolver(() => tenantId);
      writeActiveTenantId(realm, tenantId);
      await wipeTenantScopedQueries(queryClient);
      await navigate({
        to: ".",
        search: (prev) => withTenantSearch(prev, tenantId),
        replace: true,
      });
    },
    [flatTenants, navigate, queryClient, realm, resolvedTenantId],
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
