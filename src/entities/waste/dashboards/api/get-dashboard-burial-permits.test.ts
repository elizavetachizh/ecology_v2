import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getDashboardBurialPermits } from "./get-dashboard-burial-permits";
import { dashboardBurialPermitFixture } from "../model/dashboard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);
const response = [dashboardBurialPermitFixture];

describe("getDashboardBurialPermits", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests permits intersecting the year, tenant-scoped", async () => {
    await expect(getDashboardBurialPermits({ year: 2026 })).resolves.toEqual(
      response,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/burial-permits?year=2026",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getDashboardBurialPermits({ year: 2026 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/burial-permits?year=2026",
      { signal, tenantScoped: true },
    );
  });
});
