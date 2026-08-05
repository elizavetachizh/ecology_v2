import { createContext, useContext } from "react";
import type { Tenant } from "../../../entities/tenant";
import type { CurrentUser } from "../../../entities/user";

export type TenantContextValue = {
  user: CurrentUser;
  tenants: Tenant[];
  flatTenants: Tenant[];
  activeTenantId: string | null;
  activeTenant: Tenant | null;
  selectTenant: (tenantId: string) => Promise<void>;
};

export const TenantContext = createContext<TenantContextValue | null>(null);

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant должен использоваться внутри TenantProvider");
  }
  return context;
}
