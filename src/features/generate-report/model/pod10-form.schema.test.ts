import { describe, expect, it } from "vitest";
import { pod10FormSchema } from "./pod10-form.schema";

const valid = {
  start_date: "2026-01-01",
  end_date: "2026-03-01",
};

describe("pod10FormSchema", () => {
  it("accepts period without geo", () => {
    expect(pod10FormSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional region, district and entry_date", () => {
    expect(
      pod10FormSchema.safeParse({
        ...valid,
        region_id: 5,
        district_id: 12,
        entry_date: "2026-03-02",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid region_id", () => {
    const parsed = pod10FormSchema.safeParse({ ...valid, region_id: "minsk" });
    expect(parsed.success).toBe(false);
  });

  it("rejects end_date before start_date", () => {
    const parsed = pod10FormSchema.safeParse({
      ...valid,
      end_date: "2025-12-31",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.path[0] === "end_date"),
      ).toBe(true);
    }
  });

  it("accepts equal start and end dates", () => {
    expect(
      pod10FormSchema.safeParse({
        ...valid,
        start_date: "2026-03-01",
        end_date: "2026-03-01",
      }).success,
    ).toBe(true);
  });
});
