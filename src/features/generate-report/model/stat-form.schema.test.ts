import { describe, expect, it } from "vitest";
import {
  STAT_REPORT_YEAR_MAX,
  STAT_REPORT_YEAR_MIN,
} from "../../../entities/reports";
import { statFormSchema } from "./stat-form.schema";

describe("statFormSchema", () => {
  it("accepts a year in the API range", () => {
    expect(statFormSchema.safeParse({ year: 2026 }).success).toBe(true);
    expect(
      statFormSchema.safeParse({ year: STAT_REPORT_YEAR_MIN }).success,
    ).toBe(true);
    expect(
      statFormSchema.safeParse({ year: STAT_REPORT_YEAR_MAX }).success,
    ).toBe(true);
  });

  it("rejects a year outside 1900–2100", () => {
    expect(statFormSchema.safeParse({ year: 1899 }).success).toBe(false);
    expect(statFormSchema.safeParse({ year: 2101 }).success).toBe(false);
  });

  it("rejects a missing or non-integer year", () => {
    expect(statFormSchema.safeParse({}).success).toBe(false);
    expect(statFormSchema.safeParse({ year: 2026.5 }).success).toBe(false);
    expect(statFormSchema.safeParse({ year: "2026" }).success).toBe(false);
  });
});
