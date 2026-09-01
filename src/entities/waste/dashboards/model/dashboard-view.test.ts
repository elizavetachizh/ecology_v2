import { afterEach, describe, expect, it, vi } from "vitest";
import {
  firstDashboardSelection,
  flattenDashboardBalance,
  formatBalanceAmount,
  summarizeDashboardBalance,
  toChartPoints,
  todayIsoDate,
  unitTitle,
  wasteTitle,
} from "./dashboard-view";
import { dashboardBalanceFixture } from "./dashboard.fixture";

describe("todayIsoDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns local YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 1, 12, 0, 0));
    expect(todayIsoDate()).toBe("2026-09-01");
  });
});

describe("formatBalanceAmount", () => {
  it("formats numeric decimal strings in ru-RU", () => {
    expect(formatBalanceAmount("15.000000")).toBe("15");
    expect(formatBalanceAmount("10.5")).toBe("10,5");
  });

  it("returns the original value when not a number", () => {
    expect(formatBalanceAmount("n/a")).toBe("n/a");
  });
});

describe("unitTitle / wasteTitle", () => {
  it("includes short name when present", () => {
    expect(unitTitle({ name: "Цех А", short_name: "А" })).toBe("Цех А (А)");
    expect(unitTitle({ name: "Цех А", short_name: null })).toBe("Цех А");
  });

  it("joins classifier code and name", () => {
    expect(wasteTitle(dashboardBalanceFixture.wastes[0]!.waste)).toBe(
      "1010100 — Test waste",
    );
  });
});

describe("flattenDashboardBalance", () => {
  it("flattens grouped snapshot into selectable rows", () => {
    const rows = flattenDashboardBalance([dashboardBalanceFixture]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: "unit-1:waste-1",
      amount: "15.000000",
      unit: dashboardBalanceFixture.unit,
      waste: dashboardBalanceFixture.wastes[0]!.waste,
    });
  });
});

describe("summarizeDashboardBalance", () => {
  it("counts units, wastes and non-zero positions without summing UOMs", () => {
    expect(summarizeDashboardBalance([dashboardBalanceFixture])).toEqual({
      unitCount: 1,
      wasteCount: 2,
      nonZeroCount: 1,
    });
  });

  it("returns zeros for an empty snapshot", () => {
    expect(summarizeDashboardBalance([])).toEqual({
      unitCount: 0,
      wasteCount: 0,
      nonZeroCount: 0,
    });
  });
});

describe("toChartPoints", () => {
  it("converts decimal strings to numbers and treats invalid as 0", () => {
    expect(
      toChartPoints([
        { date: "2026-03-31", amount: "10.000000" },
        { date: "2026-04-30", amount: "bad" },
      ]),
    ).toEqual([
      { date: "2026-03-31", amount: 10 },
      { date: "2026-04-30", amount: 0 },
    ]);
  });
});

describe("firstDashboardSelection", () => {
  it("picks the first unit/waste pair", () => {
    expect(firstDashboardSelection([dashboardBalanceFixture])).toEqual({
      unit_id: "unit-1",
      waste_id: "waste-1",
    });
  });

  it("returns null when there are no rows", () => {
    expect(firstDashboardSelection([])).toBeNull();
    expect(
      firstDashboardSelection([
        { unit: dashboardBalanceFixture.unit, wastes: [] },
      ]),
    ).toBeNull();
  });

  it("prefers the first non-zero position", () => {
    expect(
      firstDashboardSelection([
        {
          unit: { id: "u1", name: "Цех", short_name: null },
          wastes: [
            {
              waste: dashboardBalanceFixture.wastes[1]!.waste,
              amount: "0",
            },
            {
              waste: dashboardBalanceFixture.wastes[0]!.waste,
              amount: "15.000000",
            },
          ],
        },
      ]),
    ).toEqual({ unit_id: "u1", waste_id: "waste-1" });
  });
});
