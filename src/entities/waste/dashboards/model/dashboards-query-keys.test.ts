import { describe, expect, it } from "vitest";
import { dashboardsQueryKeys } from "./dashboards-query-keys";

describe("dashboardsQueryKeys", () => {
  it("builds hierarchical balance and stat keys", () => {
    const balanceParams = { on_date: "2026-08-15" };
    const statParams = {
      on_date: "2026-08-15",
      unit_id: "unit-1",
      waste_id: "waste-1",
      months: 6,
    };

    expect(dashboardsQueryKeys.all).toEqual(["dashboards"]);
    expect(dashboardsQueryKeys.balances()).toEqual(["dashboards", "balance"]);
    expect(dashboardsQueryKeys.balance("tenant-1", balanceParams)).toEqual([
      "dashboards",
      "balance",
      "tenant-1",
      balanceParams,
    ]);
    expect(dashboardsQueryKeys.stats()).toEqual(["dashboards", "stat"]);
    expect(dashboardsQueryKeys.stat("tenant-1", statParams)).toEqual([
      "dashboards",
      "stat",
      "tenant-1",
      statParams,
    ]);

    const burialParams = { year: 2026 };
    const burialStatParams = {
      year: 2026,
      permit_id: "permit-1",
      waste_id: "waste-1",
    };
    expect(dashboardsQueryKeys.burialPermits()).toEqual([
      "dashboards",
      "burial-permits",
    ]);
    expect(dashboardsQueryKeys.burialPermit("tenant-1", burialParams)).toEqual([
      "dashboards",
      "burial-permits",
      "tenant-1",
      burialParams,
    ]);
    expect(
      dashboardsQueryKeys.burialPermitStat("tenant-1", burialStatParams),
    ).toEqual([
      "dashboards",
      "burial-permit-stat",
      "tenant-1",
      burialStatParams,
    ]);
  });
});
