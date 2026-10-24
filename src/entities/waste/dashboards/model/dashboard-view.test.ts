import { afterEach, describe, expect, it, vi } from "vitest";
import {
  currentCalendarYear,
  firstBurialPermitSelection,
  firstDashboardSelection,
  firstFormedSelection,
  flattenDashboardBalance,
  formatBalanceAmount,
  isAmountOverLimit,
  resolveSummaryRange,
  summaryPresetRange,
  sumChartAmounts,
  toChartPoints,
  toFormedMonthPoints,
  toFormedUnitPoints,
  wasteTitle,
  yearFromIsoDate,
} from "./dashboard-view";
import {
  dashboardBalanceFixture,
  dashboardBurialPermitFixture,
  dashboardFormedFixture,
  dashboardFormedStatFixture,
} from "./dashboard.fixture";
import { todayIsoDate } from "../../../../shared/lib/format-date";

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

describe("isAmountOverLimit", () => {
  it("is true only when the year fact is greater than the permit limit", () => {
    expect(isAmountOverLimit("120.000000", "100.000000")).toBe(true);
    expect(isAmountOverLimit(12, "10.000000")).toBe(true);
    expect(isAmountOverLimit("100.000000", "100.000000")).toBe(false);
    expect(isAmountOverLimit("12.000000", "100.000000")).toBe(false);
    expect(isAmountOverLimit("n/a", "100")).toBe(false);
    expect(isAmountOverLimit("12", "n/a")).toBe(false);
  });
});

describe("wasteTitle", () => {
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

describe("yearFromIsoDate", () => {
  it("reads the year prefix", () => {
    expect(yearFromIsoDate("2026-08-15", 2020)).toBe(2026);
  });

  it("falls back when the date is not ISO", () => {
    expect(yearFromIsoDate("bad", 2024)).toBe(2024);
  });
});

describe("currentCalendarYear", () => {
  it("returns the local calendar year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 1, 12, 0, 0));
    expect(currentCalendarYear()).toBe(2026);
    vi.useRealTimers();
  });
});

describe("summaryPresetRange", () => {
  const friday = new Date(2026, 9, 23, 12, 0, 0);

  it("uses the local calendar day for today", () => {
    expect(summaryPresetRange("this_day", friday)).toEqual({
      date_from: "2026-10-23",
      date_to: "2026-10-23",
    });
  });

  it("uses Monday–Sunday for the week that contains Friday 2026-10-23", () => {
    expect(summaryPresetRange("this_week", friday)).toEqual({
      date_from: "2026-10-19",
      date_to: "2026-10-25",
    });
  });

  it("keeps the same week when today is Sunday", () => {
    expect(summaryPresetRange("this_week", new Date(2026, 9, 25, 12))).toEqual({
      date_from: "2026-10-19",
      date_to: "2026-10-25",
    });
  });

  it("uses the first and last day of the month", () => {
    expect(summaryPresetRange("this_month", friday)).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-31",
    });
  });

  it("uses 1 January through 31 December", () => {
    expect(summaryPresetRange("this_year", friday)).toEqual({
      date_from: "2026-01-01",
      date_to: "2026-12-31",
    });
  });
});

describe("resolveSummaryRange", () => {
  const friday = new Date(2026, 9, 23, 12, 0, 0);

  it("resolves a named preset and ignores custom dates", () => {
    expect(
      resolveSummaryRange("this_week", "2020-01-01", "2020-01-02", friday),
    ).toEqual({
      date_from: "2026-10-19",
      date_to: "2026-10-25",
      error: null,
    });
  });

  it("accepts a custom window when the start is not after the end", () => {
    expect(
      resolveSummaryRange("custom", "2026-10-01", "2026-10-23", friday),
    ).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-23",
      error: null,
    });
  });

  it("refuses an incomplete custom window", () => {
    expect(
      resolveSummaryRange("custom", "2026-10-01", undefined, friday),
    ).toEqual({
      date_from: "2026-10-01",
      date_to: undefined,
      error: "Укажите начало и конец периода",
    });
  });

  it("refuses a custom window whose start is after the end", () => {
    expect(
      resolveSummaryRange("custom", "2026-10-31", "2026-10-01", friday),
    ).toEqual({
      date_from: "2026-10-31",
      date_to: "2026-10-01",
      error: "Дата начала позже даты окончания",
    });
  });
});

describe("firstBurialPermitSelection", () => {
  it("prefers the first non-zero waste on a permit", () => {
    expect(firstBurialPermitSelection([dashboardBurialPermitFixture])).toEqual({
      permit_id: "permit-1",
      waste_id: "waste-1",
    });
  });

  it("returns null when there are no rows", () => {
    expect(firstBurialPermitSelection([])).toBeNull();
  });
});

describe("sumChartAmounts", () => {
  it("sums numeric point amounts", () => {
    expect(
      sumChartAmounts([
        { date: "2026-01-31", amount: "5.000000" },
        { date: "2026-02-28", amount: "3" },
      ]),
    ).toBe(8);
  });
});

describe("firstFormedSelection", () => {
  it("prefers the first non-zero amount", () => {
    expect(
      firstFormedSelection([
        dashboardFormedFixture[1]!,
        dashboardFormedFixture[0]!,
      ]),
    ).toEqual({ waste_id: "waste-1" });
  });

  it("falls back to the first row when every amount is zero", () => {
    expect(firstFormedSelection([dashboardFormedFixture[1]!])).toEqual({
      waste_id: "waste-2",
    });
  });

  it("returns null when there are no rows", () => {
    expect(firstFormedSelection([])).toBeNull();
  });
});

describe("toFormedUnitPoints", () => {
  it("uses the short unit name and converts amounts", () => {
    expect(toFormedUnitPoints(dashboardFormedStatFixture.units)).toEqual([
      { name: "А", amount: 10.5 },
      { name: "Цех Б", amount: 4.5 },
    ]);
  });

  it("treats a non-numeric amount as 0", () => {
    expect(
      toFormedUnitPoints([
        { unit: dashboardBalanceFixture.unit, amount: "bad" },
      ]),
    ).toEqual([{ name: "А", amount: 0 }]);
  });
});

describe("toFormedMonthPoints", () => {
  it("maps current and previous amounts and keeps the month number", () => {
    expect(toFormedMonthPoints(dashboardFormedStatFixture.months)).toEqual([
      { month: 1, current: 1.5, previous: 0 },
      { month: 2, current: 0, previous: 2 },
      ...Array.from({ length: 10 }, (_, index) => ({
        month: index + 3,
        current: 0,
        previous: 0,
      })),
    ]);
  });

  it("treats non-numeric amounts as 0", () => {
    expect(
      toFormedMonthPoints([
        { month: 3, current_amount: "n/a", previous_amount: "bad" },
      ]),
    ).toEqual([{ month: 3, current: 0, previous: 0 }]);
  });
});
