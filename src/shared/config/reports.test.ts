import { describe, expect, it } from "vitest";
import { REPORT_NAV_ITEMS, REPORTS } from "./reports";
import { routes } from "./routes";

describe("REPORTS", () => {
  it("maps catalog entries to routes", () => {
    expect(REPORTS.pod9.to).toBe(routes.reports.pod9);
    expect(REPORTS.pod10.to).toBe(routes.reports.pod10);
    expect(REPORT_NAV_ITEMS.map((item) => item.id)).toEqual(["pod-9", "pod-10"]);
  });
});
