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
  storage_facility_type: "" as const,
  disposal_facility_type: "" as const,
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

  it("requires a storage facility type when ownership stays with the producer", () => {
    const parsed = contractFormSchema.safeParse({
      ...valid,
      transfer_purpose: "storage",
      with_ownership_transfer: false,
      storage_facility_type: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.path[0])).toContain(
        "storage_facility_type",
      );
    }
  });

  it("requires a disposal facility type when ownership stays with the producer", () => {
    const parsed = contractFormSchema.safeParse({
      ...valid,
      transfer_purpose: "disposal",
      with_ownership_transfer: false,
      disposal_facility_type: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.path[0])).toContain(
        "disposal_facility_type",
      );
    }
  });

  it("does not require a facility type when ownership is transferred", () => {
    expect(
      contractFormSchema.safeParse({
        ...valid,
        transfer_purpose: "storage",
        with_ownership_transfer: true,
        storage_facility_type: "",
        disposal_facility_type: "",
      }).success,
    ).toBe(true);
    expect(
      contractFormSchema.safeParse({
        ...valid,
        transfer_purpose: "disposal",
        with_ownership_transfer: true,
        storage_facility_type: "",
        disposal_facility_type: "",
      }).success,
    ).toBe(true);
  });

  it("does not require a facility type for purposes other than storage and disposal", () => {
    expect(
      contractFormSchema.safeParse({
        ...valid,
        transfer_purpose: "use",
        with_ownership_transfer: false,
        storage_facility_type: "",
        disposal_facility_type: "",
      }).success,
    ).toBe(true);
  });

  it("accepts storage without ownership when the facility type is set", () => {
    expect(
      contractFormSchema.safeParse({
        ...valid,
        transfer_purpose: "storage",
        with_ownership_transfer: false,
        storage_facility_type: "undeground_tank",
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
