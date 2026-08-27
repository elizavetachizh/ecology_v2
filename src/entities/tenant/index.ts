export { getTenants } from "./api/get-tenants";
export type { Tenant } from "./model/tenant.types";
export {
  flattenTenants,
  isKnownTenant,
  resolveActiveTenantId,
} from "./model/resolve-active-tenant";
export {
  filterTenantTree,
  flattenTenantTree,
  tenantLabel,
  type TenantTreeNode,
} from "./model/flatten-tenant-tree";
export { TenantSelect, type TenantSelectProps } from "./ui/TenantSelect";
export {
  TenantContext,
  useTenant,
  type TenantContextValue,
} from "./model/tenant-context";
