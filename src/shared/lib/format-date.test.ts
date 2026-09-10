import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addYearsIsoDate,
  formatDate,
  formatDateTime,
  todayIsoDate,
} from "./format-date";

describe("formatDate", () => {
  it("formats an ISO date as dd.mm.yyyy", () => {
    expect(formatDate("2026-03-01")).toBe("01.03.2026");
  });

  it("returns a dash for empty values", () => {
    expect(formatDate(null)).toBe("—");
  });
});

describe("formatDateTime", () => {
  it("formats an ISO datetime", () => {
    expect(formatDateTime("2026-03-01T00:00:00Z")).toBe(
      new Date("2026-03-01T00:00:00Z").toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  });

  it("returns a dash for empty values", () => {
    expect(formatDateTime(null)).toBe("—");
  });
});

describe("addYearsIsoDate", () => {
  it("shifts a calendar date by the given years", () => {
    expect(addYearsIsoDate("2026-09-10", 5)).toBe("2031-09-10");
  });

  it("moves Feb 29 to Mar 1 when the target year is not a leap year", () => {
    expect(addYearsIsoDate("2024-02-29", 5)).toBe("2029-03-01");
  });
});

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
