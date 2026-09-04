import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  TenantContext,
  type Tenant,
  type TenantContextValue,
} from "../../../entities/tenant";
import { currentUser } from "../../../entities/user";
import { TenantSwitcher } from "./TenantSwitcher";

const user = currentUser({ email: null });

const child: Tenant = {
  id: "child",
  realm: "mingas",
  name: "Филиал",
  short: "Филиал",
  parent_id: "parent",
  children: [],
};

const parent: Tenant = {
  id: "parent",
  realm: "mingas",
  name: "Головная",
  short: "Головная",
  parent_id: null,
  children: [child],
};

const value: TenantContextValue = {
  user,
  tenants: [parent],
  flatTenants: [parent, child],
  activeTenantId: "parent",
  activeTenant: parent,
  selectTenant: vi.fn(),
};

function wrapper({ children }: { children: ReactNode }) {
  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

describe("TenantSwitcher", () => {
  it("shows the active organization from tenant context", () => {
    render(<TenantSwitcher />, { wrapper });
    expect(
      screen.getByRole("combobox", { name: "Активная организация" }),
    ).toHaveTextContent("Головная");
  });
});
