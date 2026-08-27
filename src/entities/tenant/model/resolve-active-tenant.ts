import type { Tenant } from "./tenant.types";

export function flattenTenants(tenants: Tenant[]): Tenant[] {
  return tenants.flatMap((tenant) => [
    tenant,
    ...flattenTenants(tenant.children ?? []),
  ]);
}

export function isKnownTenant(
  flatTenants: Tenant[],
  tenantId: string | null | undefined,
): boolean {
  return Boolean(
    tenantId && flatTenants.some((tenant) => tenant.id === tenantId),
  );
}

/**
 * URL этой вкладки важнее last-used в storage.
 * Storage — гидратация, когда в ссылке нет tenant.
 * Один доступный tenant выбирается сам.
 */
export function resolveActiveTenantId(
  flatTenants: Tenant[],
  urlId: string | null | undefined,
  storedId: string | null | undefined,
): string | null {
  if (isKnownTenant(flatTenants, urlId)) return urlId ?? null;
  if (isKnownTenant(flatTenants, storedId)) return storedId ?? null;
  if (flatTenants.length === 1) return flatTenants[0]!.id;
  return null;
}
