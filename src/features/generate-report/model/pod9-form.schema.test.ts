import { describe, expect, it } from "vitest";
import { pod9FormSchema } from "./pod9-form.schema";

const valid = {
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
  instruction_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
  start_date: "2026-01-01",
  end_date: "2026-03-01",
};

describe("pod9FormSchema", () => {
  it("accepts backend query params", () => {
    expect(pod9FormSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a unit", () => {
    const parsed = pod9FormSchema.safeParse({ ...valid, unit_id: "" });
    expect(parsed.success).toBe(false);
  });

  it("requires an instruction", () => {
    const parsed = pod9FormSchema.safeParse({ ...valid, instruction_id: "" });
    expect(parsed.success).toBe(false);
  });

  it("rejects end_date before start_date", () => {
    const parsed = pod9FormSchema.safeParse({
      ...valid,
      end_date: "2025-12-31",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path[0] === "end_date")).toBe(
        true,
      );
    }
  });

  it("accepts equal start and end dates", () => {
    expect(
      pod9FormSchema.safeParse({
        ...valid,
        start_date: "2026-03-01",
        end_date: "2026-03-01",
      }).success,
    ).toBe(true);
  });
});
