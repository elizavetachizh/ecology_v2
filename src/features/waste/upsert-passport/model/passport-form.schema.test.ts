import { describe, expect, it } from "vitest";
import { passportFormSchema } from "./passport-form.schema";

const valid = {
  number: "СП-001",
  date: "2026-03-15",
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
  recycling_contract_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
  waste_ids: ["7ba7b810-9dad-41d1-80b4-00c04fd430c8"],
  transport_type: "self" as const,
  transport_contract_id: "",
  waste_producer_type: "self" as const,
  waste_producer_id: "",
};

describe("passportFormSchema", () => {
  it("accepts self transport without transport contract", () => {
    expect(passportFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty wastes", () => {
    const parsed = passportFormSchema.safeParse({ ...valid, waste_ids: [] });
    expect(parsed.success).toBe(false);
  });

  it("requires transport contract when transport_type is transport_contract", () => {
    const parsed = passportFormSchema.safeParse({
      ...valid,
      transport_type: "transport_contract",
      transport_contract_id: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts transport_contract with a contract id", () => {
    expect(
      passportFormSchema.safeParse({
        ...valid,
        transport_type: "transport_contract",
        transport_contract_id: "8ba7b810-9dad-41d1-80b4-00c04fd430c8",
      }).success,
    ).toBe(true);
  });

  it("rejects duplicate waste ids", () => {
    const wasteId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";
    const parsed = passportFormSchema.safeParse({
      ...valid,
      waste_ids: [wasteId, wasteId],
    });
    expect(parsed.success).toBe(false);
  });

  it("requires counterparty when waste producer is counterparty", () => {
    const parsed = passportFormSchema.safeParse({
      ...valid,
      waste_producer_type: "counterparty",
      waste_producer_id: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts counterparty producer with an id", () => {
    expect(
      passportFormSchema.safeParse({
        ...valid,
        waste_producer_type: "counterparty",
        waste_producer_id: "8ba7b810-9dad-41d1-80b4-00c04fd430c8",
      }).success,
    ).toBe(true);
  });
});
