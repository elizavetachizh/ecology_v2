import { describe, expect, it } from "vitest";
import {
  journalPeriodDefaults,
  journalPeriodSchema,
} from "./journal-period.schema";

describe("journalPeriodSchema", () => {
  it("accepts a valid period", () => {
    expect(
      journalPeriodSchema.safeParse({
        start_date: "2026-01-01",
        end_date: "2026-12-31",
      }).success,
    ).toBe(true);
  });

  it("rejects an inverted period", () => {
    const result = journalPeriodSchema.safeParse({
      start_date: "2026-12-31",
      end_date: "2026-01-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/раньше даты начала/);
    }
  });
});

describe("journalPeriodDefaults", () => {
  it("keeps provided dates", () => {
    expect(journalPeriodDefaults("2026-02-01", "2026-02-28")).toEqual({
      start_date: "2026-02-01",
      end_date: "2026-02-28",
    });
  });
});
