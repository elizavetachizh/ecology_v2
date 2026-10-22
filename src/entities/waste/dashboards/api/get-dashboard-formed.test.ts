import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getDashboardFormed } from "./get-dashboard-formed";
import { dashboardBalanceFixture } from "../model/dashboard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);
const response = [
  {
    waste: dashboardBalanceFixture.wastes[0]!.waste,
    amount: "15.000000",
  },
];

describe("getDashboardFormed", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests formed wastes for the year, tenant-scoped", async () => {
    await expect(getDashboardFormed({ year: 2026 })).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/formed?year=2026",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getDashboardFormed({ year: 2026 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/formed?year=2026",
      { signal, tenantScoped: true },
    );
  });
});
