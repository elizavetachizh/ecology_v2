import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "../../user";
import type { Tenant } from "./tenant.types";
import {
  TenantContext,
  useTenant,
  type TenantContextValue,
} from "./tenant-context";

const user: CurrentUser = {
  id: 1,
  realm: "tenant-01",
  uuid: "user-id",
  username: "testuser",
  email: "test@example.com",
  roles: ["operator"],
  issuer: "https://auth.example.com/realms/tenant-01",
};

const tenant: Tenant = {
  id: "tenant-1",
  realm: "tenant-01",
  name: "Tenant 1",
  short: "T1",
  parent_id: null,
  children: [],
};

const value: TenantContextValue = {
  user,
  tenants: [tenant],
  flatTenants: [tenant],
  activeTenantId: tenant.id,
  activeTenant: tenant,
  selectTenant: vi.fn(),
};

describe("useTenant", () => {
  it("throws outside TenantProvider", () => {
    expect(() => renderHook(() => useTenant())).toThrow(
      "useTenant должен использоваться внутри TenantProvider",
    );
  });

  it("returns context value inside the provider", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
    );

    const { result } = renderHook(() => useTenant(), { wrapper });

    expect(result.current).toBe(value);
    expect(result.current.activeTenantId).toBe("tenant-1");
  });
});
