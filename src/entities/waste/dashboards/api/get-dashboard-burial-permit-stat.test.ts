import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getDashboardBurialPermitStat } from "./get-dashboard-burial-permit-stat";
import { dashboardBurialPermitStatFixture } from "../model/dashboard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const params = {
  year: 2026,
  permit_id: "permit-1",
  waste_id: "waste-1",
};

describe("getDashboardBurialPermitStat", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(dashboardBurialPermitStatFixture);
  });

  it("requests monthly points for permit and waste, tenant-scoped", async () => {
    await expect(getDashboardBurialPermitStat(params)).resolves.toEqual(
      dashboardBurialPermitStatFixture,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/burial-permits/stat?year=2026&permit_id=permit-1&waste_id=waste-1",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getDashboardBurialPermitStat(params, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/burial-permits/stat?year=2026&permit_id=permit-1&waste_id=waste-1",
      { signal, tenantScoped: true },
    );
  });
});
