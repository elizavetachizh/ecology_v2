import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "./format-date";

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
