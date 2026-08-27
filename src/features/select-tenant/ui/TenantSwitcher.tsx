import { TenantSelect, useTenant } from "../../../entities/tenant";

export function TenantSwitcher() {
  const { tenants, activeTenantId, selectTenant } = useTenant();

  return (
    <TenantSelect
      tenants={tenants}
      value={activeTenantId}
      onValueChange={(tenantId) => void selectTenant(tenantId)}
      className="max-w-[12rem] sm:max-w-xs"
    />
  );
}
