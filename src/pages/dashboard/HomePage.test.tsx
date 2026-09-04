import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TenantContext,
  type Tenant,
  type TenantContextValue,
} from "../../entities/tenant";
import { currentUser } from "../../entities/user";
import { getDashboardBalance } from "../../entities/waste/dashboards";
import { getDashboardBalanceStat } from "../../entities/waste/dashboards";
import {
  dashboardBalanceFixture,
  dashboardBalanceStatFixture,
} from "../../entities/waste/dashboards/model/dashboard.fixture";
import { HomePage } from "./HomePage";

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => ({ on_date: "2026-08-15" }),
  useNavigate: () => navigateMock,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

vi.mock("../../entities/waste/dashboards/api/get-dashboard-balance", () => ({
  getDashboardBalance: vi.fn(),
}));

vi.mock(
  "../../entities/waste/dashboards/api/get-dashboard-balance-stat",
  () => ({
    getDashboardBalanceStat: vi.fn(),
  }),
);

const getDashboardBalanceMock = vi.mocked(getDashboardBalance);
const getDashboardBalanceStatMock = vi.mocked(getDashboardBalanceStat);

const user = currentUser({ email: null });

const tenant: Tenant = {
  id: "tenant-1",
  realm: "mingas",
  name: "Головная",
  short: "Головная",
  parent_id: null,
  children: [],
};

const tenantValue: TenantContextValue = {
  user,
  tenants: [tenant],
  flatTenants: [tenant],
  activeTenantId: "tenant-1",
  activeTenant: tenant,
  selectTenant: vi.fn(),
};

const noTenantValue: TenantContextValue = {
  ...tenantValue,
  activeTenantId: null,
  activeTenant: null,
};

function renderPage(value: TenantContextValue = tenantValue) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <TenantContext.Provider value={value}>
        <HomePage />
      </TenantContext.Provider>
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("HomePage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getDashboardBalanceMock.mockReset();
    getDashboardBalanceStatMock.mockReset();
    getDashboardBalanceMock.mockResolvedValue([dashboardBalanceFixture]);
    getDashboardBalanceStatMock.mockResolvedValue(dashboardBalanceStatFixture);
  });

  it("asks to pick an organization when tenant is missing", () => {
    renderPage(noTenantValue);
    expect(screen.getByText("Выберите организацию")).toBeInTheDocument();
    expect(getDashboardBalanceMock).not.toHaveBeenCalled();
  });

  it("loads the as-of snapshot and the first series", async () => {
    renderPage();

    expect(await screen.findByText("Остатки отходов")).toBeInTheDocument();
    expect(await screen.findByText("Test waste")).toBeInTheDocument();
    expect(screen.getByText("Подразделений")).toBeInTheDocument();
    expect(screen.getByText("Позиций")).toBeInTheDocument();

    await waitFor(() => {
      expect(getDashboardBalanceMock).toHaveBeenCalledWith(
        { on_date: "2026-08-15" },
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(getDashboardBalanceStatMock).toHaveBeenCalledWith(
        {
          on_date: "2026-08-15",
          unit_id: "unit-1",
          waste_id: "waste-1",
          months: 6,
        },
        expect.any(AbortSignal),
      );
    });
  });

  it("writes the clicked waste to search params", async () => {
    renderPage();
    await screen.findByText("Zero waste");

    fireEvent.click(screen.getByText("Zero waste"));

    expect(navigateMock).toHaveBeenCalled();
    const updater = navigateMock.mock.calls[0]![0].search as (prev: {
      on_date?: string;
    }) => unknown;
    expect(updater({ on_date: "2026-08-15" })).toEqual({
      on_date: "2026-08-15",
      unit_id: "unit-1",
      waste_id: "waste-2",
    });
  });

  it("shows an error when the snapshot request fails", async () => {
    getDashboardBalanceMock.mockRejectedValue(new Error("boom"));
    renderPage();

    expect(
      await screen.findByText("Не удалось загрузить остатки"),
    ).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});
