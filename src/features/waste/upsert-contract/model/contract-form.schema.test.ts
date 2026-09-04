import { describe, expect, it } from "vitest";
import { contractFormSchema } from "./contract-form.schema";

const valid = {
  number: "Д-001",
  start_date: "2026-01-15",
  end_date: "2026-12-31",
  contract_type: "recycling" as const,
  status: "active" as const,
  counterparty_id: "550e8400-e29b-41d4-a716-446655440000",
  counterparty_address: "",
  counterparty_contact: "",
  amount: "",
  with_ownership_transfer: false,
  transfer_purpose: "use" as const,
  wastes: [],
};

describe("contractFormSchema", () => {
  it("accepts recycling contract without amount and wastes", () => {
    expect(contractFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects end_date before start_date", () => {
    const parsed = contractFormSchema.safeParse({
      ...valid,
      end_date: "2026-01-01",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts empty draft waste rows", () => {
    expect(
      contractFormSchema.safeParse({
        ...valid,
        wastes: [{ waste_id: "", cost_per_unit: "", label: "" }],
      }).success,
    ).toBe(true);
  });

  it("rejects duplicate wastes", () => {
    const wasteId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
    const parsed = contractFormSchema.safeParse({
      ...valid,
      wastes: [
        { waste_id: wasteId, cost_per_unit: "", label: "A" },
        { waste_id: wasteId, cost_per_unit: "1", label: "A" },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects amount that is not greater than 0", () => {
    expect(
      contractFormSchema.safeParse({ ...valid, amount: "0" }).success,
    ).toBe(false);
  });

  it("requires transfer_purpose for recycling", () => {
    expect(
      contractFormSchema.safeParse({ ...valid, transfer_purpose: "" }).success,
    ).toBe(false);
  });

  it("accepts transport without transfer_purpose", () => {
    expect(
      contractFormSchema.safeParse({
        ...valid,
        contract_type: "transport",
        transfer_purpose: "",
        with_ownership_transfer: false,
      }).success,
    ).toBe(true);
  });

  it("rejects counterparty snapshot fields longer than 255", () => {
    const tooLong = "x".repeat(256);
    expect(
      contractFormSchema.safeParse({
        ...valid,
        counterparty_address: tooLong,
      }).success,
    ).toBe(false);
    expect(
      contractFormSchema.safeParse({
        ...valid,
        counterparty_contact: tooLong,
      }).success,
    ).toBe(false);
  });
});
