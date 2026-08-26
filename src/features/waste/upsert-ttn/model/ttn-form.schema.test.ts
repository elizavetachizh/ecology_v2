import { describe, expect, it } from "vitest";
import { ttnFormSchema } from "./ttn-form.schema";

const valid = {
  number: "ТТН-001",
  date: "2026-03-15",
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
  recycling_contract_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
};

describe("ttnFormSchema", () => {
  it("accepts required fields", () => {
    expect(ttnFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty number", () => {
    expect(ttnFormSchema.safeParse({ ...valid, number: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing recycling contract", () => {
    expect(
      ttnFormSchema.safeParse({ ...valid, recycling_contract_id: "" }).success,
    ).toBe(false);
  });
});
