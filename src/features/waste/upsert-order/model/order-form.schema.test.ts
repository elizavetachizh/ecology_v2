import { describe, expect, it } from "vitest";
import { orderFormSchema } from "./order-form.schema";

const valid = {
  number: "12-ОД",
  start_date: "2026-01-15",
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
};

describe("orderFormSchema", () => {
  it("accepts number, start_date and unit_id", () => {
    expect(orderFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty number", () => {
    const parsed = orderFormSchema.safeParse({ ...valid, number: "  " });
    expect(parsed.success).toBe(false);
  });

  it("rejects number longer than 255", () => {
    const parsed = orderFormSchema.safeParse({
      ...valid,
      number: "x".repeat(256),
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid start_date", () => {
    const parsed = orderFormSchema.safeParse({
      ...valid,
      start_date: "15.01.2026",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing unit_id", () => {
    const parsed = orderFormSchema.safeParse({ ...valid, unit_id: "" });
    expect(parsed.success).toBe(false);
  });
});
