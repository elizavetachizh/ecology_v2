import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getDashboardBalanceStat } from "./get-dashboard-balance-stat";
import { dashboardBalanceStatFixture } from "../model/dashboard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getDashboardBalanceStat", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(dashboardBalanceStatFixture);
  });

  it("requests month-end points, tenant-scoped", async () => {
    await expect(
      getDashboardBalanceStat({
        on_date: "2026-08-15",
        unit_id: "unit-1",
        waste_id: "waste-1",
        months: 6,
      }),
    ).resolves.toEqual(dashboardBalanceStatFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/balance/stat?on_date=2026-08-15&unit_id=unit-1&waste_id=waste-1&months=6",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits months when not provided so API default applies", async () => {
    await getDashboardBalanceStat({
      on_date: "2026-08-15",
      unit_id: "unit-1",
      waste_id: "waste-1",
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/balance/stat?on_date=2026-08-15&unit_id=unit-1&waste_id=waste-1",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getDashboardBalanceStat(
      {
        on_date: "2026-08-15",
        unit_id: "unit-1",
        waste_id: "waste-1",
      },
      signal,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/balance/stat?on_date=2026-08-15&unit_id=unit-1&waste_id=waste-1",
      { signal, tenantScoped: true },
    );
  });
});
