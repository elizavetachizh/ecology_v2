import { describe, expect, it } from "vitest";
import {
  facilityKind,
  normalizeOwnership,
  onContractTypeChange,
  onOwnershipEnabled,
  onTransferPurposeChange,
  ownershipEditable,
} from "./contract-form-rules";

describe("contract form rules", () => {
  it("lets ownership change only for storage and disposal", () => {
    expect(ownershipEditable("storage")).toBe(true);
    expect(ownershipEditable("disposal")).toBe(true);
    expect(ownershipEditable("use")).toBe(false);
    expect(ownershipEditable("")).toBe(false);
  });

  it("asks for a facility type only when ownership stays with the producer", () => {
    expect(facilityKind("storage", false)).toBe("storage");
    expect(facilityKind("disposal", false)).toBe("disposal");
    expect(facilityKind("storage", true)).toBeNull();
    expect(facilityKind("use", false)).toBeNull();
  });

  it("forces ownership on for recycling purposes that cannot opt out", () => {
    expect(normalizeOwnership("recycling", "use", false)).toBe(true);
    expect(normalizeOwnership("recycling", "", false)).toBe(true);
    expect(normalizeOwnership("recycling", "storage", false)).toBe(false);
    expect(normalizeOwnership("transport", "use", false)).toBe(false);
  });

  it("clears both facility types and turns ownership on outside storage and disposal", () => {
    expect(onTransferPurposeChange("storage", "use")).toEqual({
      with_ownership_transfer: true,
      storage_facility_type: "",
      disposal_facility_type: "",
    });
  });

  it("clears only the facility type of the purpose being left", () => {
    expect(onTransferPurposeChange("storage", "disposal")).toEqual({
      storage_facility_type: "",
    });
    expect(onTransferPurposeChange("disposal", "storage")).toEqual({
      disposal_facility_type: "",
    });
    expect(onTransferPurposeChange("", "storage")).toEqual({});
  });

  it("clears both facility types when ownership is turned on", () => {
    expect(onOwnershipEnabled()).toEqual({
      storage_facility_type: "",
      disposal_facility_type: "",
    });
  });

  it("resets recycling-only fields for transport and restores ownership for recycling", () => {
    expect(onContractTypeChange("transport")).toEqual({
      kind: "transport",
      transfer_purpose: "",
      with_ownership_transfer: false,
      storage_facility_type: "",
      disposal_facility_type: "",
    });
    expect(onContractTypeChange("recycling")).toEqual({
      kind: "recycling",
      with_ownership_transfer: true,
    });
  });
});
