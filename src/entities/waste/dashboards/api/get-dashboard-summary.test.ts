import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getDashboardSummary } from "./get-dashboard-summary";
import { dashboardSummaryFixture } from "../model/dashboard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getDashboardSummary", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(dashboardSummaryFixture);
  });

  it("requests the date window, tenant-scoped, without a preset name", async () => {
    await expect(
      getDashboardSummary({
        date_from: "2026-10-01",
        date_to: "2026-10-23",
      }),
    ).resolves.toEqual(dashboardSummaryFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/summary?date_from=2026-10-01&date_to=2026-10-23",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getDashboardSummary(
      { date_from: "2026-10-01", date_to: "2026-10-23" },
      signal,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/summary?date_from=2026-10-01&date_to=2026-10-23",
      { signal, tenantScoped: true },
    );
  });
});
