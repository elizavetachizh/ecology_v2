import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getDashboardFormedStat } from "./get-dashboard-formed-stat";
import { dashboardBalanceFixture } from "../model/dashboard.fixture";
import type { DashboardFormedStat } from "../model/dashboards.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const params = {
  year: 2026,
  waste_id: "waste-1",
};

const response: DashboardFormedStat = {
  waste: dashboardBalanceFixture.wastes[0]!.waste,
  year: 2026,
  previous_year: 2025,
  units: [
    {
      unit: dashboardBalanceFixture.unit,
      amount: "15.000000",
    },
  ],
  months: [{ month: 1, current_amount: "1.000000", previous_amount: "0" }],
};

describe("getDashboardFormedStat", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests unit and month stats for the waste, tenant-scoped", async () => {
    await expect(getDashboardFormedStat(params)).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/formed/stat?year=2026&waste_id=waste-1",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getDashboardFormedStat(params, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/formed/stat?year=2026&waste_id=waste-1",
      { signal, tenantScoped: true },
    );
  });
});
