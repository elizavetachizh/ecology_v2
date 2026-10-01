export type FacilityKind = "storage" | "disposal";

export function ownershipEditable(purpose: string): boolean {
  return purpose === "storage" || purpose === "disposal";
}

/** Селект типа объекта виден только без права собственности и в своей цели. */
export function facilityKind(
  purpose: string,
  withOwnershipTransfer: boolean,
): FacilityKind | null {
  if (withOwnershipTransfer) return null;
  if (purpose === "storage" || purpose === "disposal") return purpose;
  return null;
}

/** Для целей вне хранения и захоронения право всегда включено. */
export function normalizeOwnership(
  contractType: string,
  purpose: string,
  withOwnershipTransfer: boolean,
): boolean {
  if (contractType === "recycling" && !ownershipEditable(purpose)) return true;
  return withOwnershipTransfer;
}

export type TransferPurposePatch = {
  with_ownership_transfer?: true;
  storage_facility_type?: "";
  disposal_facility_type?: "";
};

export function onTransferPurposeChange(
  previous: string,
  next: string,
): TransferPurposePatch {
  if (!ownershipEditable(next)) {
    return {
      with_ownership_transfer: true,
      storage_facility_type: "",
      disposal_facility_type: "",
    };
  }
  if (previous === "storage" && next !== "storage") {
    return { storage_facility_type: "" };
  }
  if (previous === "disposal" && next !== "disposal") {
    return { disposal_facility_type: "" };
  }
  return {};
}

export function onOwnershipEnabled(): Pick<
  TransferPurposePatch,
  "storage_facility_type" | "disposal_facility_type"
> {
  return {
    storage_facility_type: "",
    disposal_facility_type: "",
  };
}

export type ContractTypeChange =
  | {
      kind: "transport";
      transfer_purpose: "";
      with_ownership_transfer: false;
      storage_facility_type: "";
      disposal_facility_type: "";
    }
  | {
      kind: "recycling";
      with_ownership_transfer: true;
    };

export function onContractTypeChange(next: string): ContractTypeChange {
  if (next === "transport") {
    return {
      kind: "transport",
      transfer_purpose: "",
      with_ownership_transfer: false,
      storage_facility_type: "",
      disposal_facility_type: "",
    };
  }
  return { kind: "recycling", with_ownership_transfer: true };
}
