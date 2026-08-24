import { describe, expect, it } from "vitest";
import { toPassportWriteBody } from "./map-passport-form";
import type { PassportFormValues } from "./passport-form.schema";

const values: PassportFormValues = {
  number: " СП-001 ",
  date: "2026-03-15",
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
  status: "active",
  recycling_contract_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
  waste_ids: ["7ba7b810-9dad-41d1-80b4-00c04fd430c8"],
  transport_type: "self",
  transport_contract_id: "8ba7b810-9dad-41d1-80b4-00c04fd430c8",
  waste_producer_id: "  ",
};

describe("toPassportWriteBody", () => {
  it("nulls transport_contract_id for self and recycling_contract", () => {
    expect(toPassportWriteBody(values).transport_contract_id).toBeNull();
    expect(
      toPassportWriteBody({
        ...values,
        transport_type: "recycling_contract",
      }).transport_contract_id,
    ).toBeNull();
  });

  it("keeps transport_contract_id only for transport_contract", () => {
    expect(
      toPassportWriteBody({
        ...values,
        transport_type: "transport_contract",
      }).transport_contract_id,
    ).toBe("8ba7b810-9dad-41d1-80b4-00c04fd430c8");
  });

  it("trims number, nulls empty producer, maps wastes", () => {
    expect(toPassportWriteBody(values)).toMatchObject({
      number: "СП-001",
      waste_producer_id: null,
      wastes: [{ waste_id: "7ba7b810-9dad-41d1-80b4-00c04fd430c8" }],
    });
  });
});
