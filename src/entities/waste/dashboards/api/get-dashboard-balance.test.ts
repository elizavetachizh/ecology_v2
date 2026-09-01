import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getDashboardBalance } from "./get-dashboard-balance";
import { dashboardBalanceFixture } from "../model/dashboard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);
const response = [dashboardBalanceFixture];

describe("getDashboardBalance", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests as-of snapshot, tenant-scoped", async () => {
    await expect(
      getDashboardBalance({ on_date: "2026-08-15" }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/balance?on_date=2026-08-15",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getDashboardBalance({ on_date: "2026-08-15" }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/dashboards/balance?on_date=2026-08-15",
      { signal, tenantScoped: true },
    );
  });
});
