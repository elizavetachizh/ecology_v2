import { describe, expect, it } from "vitest";
import type { Contract } from "../../../../entities/waste/contracts";
import type { UserProfile } from "../../../../entities/user";
import type { ContractFormValues } from "./contract-form.schema";
import { toContractFormValues, toContractWriteBody } from "./map-contract-form";

const profile: UserProfile = {
  id: "99999999-9999-4999-8999-999999999999",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
  last_seen_at: null,
};

const formValues = (
  overrides: Partial<ContractFormValues> = {},
): ContractFormValues => ({
  number: "Д-001",
  start_date: "2026-01-15",
  end_date: "",
  contract_type: "recycling",
  status: "active",
  counterparty_id: "550e8400-e29b-41d4-a716-446655440000",
  counterparty_address: "",
  counterparty_contact: "",
  amount: "",
  with_ownership_transfer: false,
  transfer_purpose: "use",
  storage_facility_type: "",
  disposal_facility_type: "",
  wastes: [],
  ...overrides,
});

describe("toContractWriteBody", () => {
  it("sends empty optionals as null and empty wastes as replace-all list", () => {
    expect(
      toContractWriteBody(
        formValues({
          number: " Д-001 ",
          contract_type: "transport",
          counterparty_address: "  ",
          counterparty_contact: "  ",
          amount: "  ",
          with_ownership_transfer: true,
          transfer_purpose: "use",
          storage_facility_type: "sludge",
          disposal_facility_type: "other",
          wastes: [
            {
              waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
              cost_per_unit: "",
              label: "Отход",
            },
          ],
        }),
      ),
    ).toEqual({
      number: "Д-001",
      start_date: "2026-01-15",
      end_date: null,
      contract_type: "transport",
      status: "active",
      counterparty_id: "550e8400-e29b-41d4-a716-446655440000",
      counterparty_address: null,
      counterparty_contact: null,
      amount: null,
      with_ownership_transfer: false,
      transfer_purpose: null,
      storage_facility_type: null,
      disposal_facility_type: null,
      wastes: [],
    });
  });

  it("drops leftover wastes for a transport contract", () => {
    expect(
      toContractWriteBody(
        formValues({
          contract_type: "transport",
          with_ownership_transfer: false,
          transfer_purpose: "",
          wastes: [
            {
              waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
              cost_per_unit: "10",
              label: "Отход",
            },
          ],
        }),
      ).wastes,
    ).toEqual([]);
  });

  it("omits empty draft waste rows from the write body", () => {
    expect(
      toContractWriteBody(
        formValues({
          wastes: [
            {
              waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
              cost_per_unit: "10",
              label: "Отход",
            },
            { waste_id: "", cost_per_unit: "", label: "" },
          ],
        }),
      ).wastes,
    ).toEqual([
      {
        waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
        cost_per_unit: "10",
      },
    ]);
  });

  it("sends transfer fields for recycling", () => {
    expect(
      toContractWriteBody(
        formValues({
          counterparty_address: "г. Минск",
          counterparty_contact: "+375 17 000-00-00",
          with_ownership_transfer: true,
          transfer_purpose: "disposal",
          storage_facility_type: "sludge",
          disposal_facility_type: "landfill_msw",
        }),
      ),
    ).toMatchObject({
      contract_type: "recycling",
      with_ownership_transfer: true,
      transfer_purpose: "disposal",
      storage_facility_type: null,
      disposal_facility_type: null,
      counterparty_address: "г. Минск",
      counterparty_contact: "+375 17 000-00-00",
    });
  });

  it("sends a storage facility type only without ownership transfer", () => {
    expect(
      toContractWriteBody(
        formValues({
          with_ownership_transfer: false,
          transfer_purpose: "storage",
          storage_facility_type: "undeground_tank",
          disposal_facility_type: "other",
        }),
      ),
    ).toMatchObject({
      with_ownership_transfer: false,
      transfer_purpose: "storage",
      storage_facility_type: "undeground_tank",
      disposal_facility_type: null,
    });
  });

  it("sends a disposal facility type only without ownership transfer", () => {
    expect(
      toContractWriteBody(
        formValues({
          with_ownership_transfer: false,
          transfer_purpose: "disposal",
          storage_facility_type: "dump",
          disposal_facility_type: "landfill_industrial",
        }),
      ),
    ).toMatchObject({
      with_ownership_transfer: false,
      transfer_purpose: "disposal",
      storage_facility_type: null,
      disposal_facility_type: "landfill_industrial",
    });
  });

  it("forces ownership transfer for use and clears both facility types", () => {
    expect(
      toContractWriteBody(
        formValues({
          with_ownership_transfer: false,
          transfer_purpose: "use",
          storage_facility_type: "temporary",
          disposal_facility_type: "landfill_toxic",
        }),
      ),
    ).toMatchObject({
      with_ownership_transfer: true,
      transfer_purpose: "use",
      storage_facility_type: null,
      disposal_facility_type: null,
    });
  });
});

describe("toContractFormValues", () => {
  it("reads facility types into form strings", () => {
    const contract: Contract = {
      id: "44444444-4444-4444-8444-444444444444",
      tenant_id: "11111111-1111-4111-8111-111111111111",
      number: "Д-001",
      start_date: "2026-01-15",
      end_date: null,
      contract_type: "recycling",
      status: "active",
      counterparty_id: "550e8400-e29b-41d4-a716-446655440000",
      counterparty: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Ромашка",
      },
      counterparty_address: null,
      counterparty_contact: null,
      amount: null,
      with_ownership_transfer: false,
      transfer_purpose: "storage",
      storage_facility_type: "sludge",
      disposal_facility_type: null,
      wastes: [],
      created_at: "2026-01-15T00:00:00Z",
      updated_at: "2026-01-15T00:00:00Z",
      created_by: profile,
      updated_by: profile,
    };
    const values = toContractFormValues(contract);

    expect(values.storage_facility_type).toBe("sludge");
    expect(values.disposal_facility_type).toBe("");
    expect(values.transfer_purpose).toBe("storage");
    expect(values.with_ownership_transfer).toBe(false);

    const locked = toContractFormValues({
      ...contract,
      transfer_purpose: "use",
      with_ownership_transfer: false,
      storage_facility_type: null,
    });
    expect(locked.with_ownership_transfer).toBe(true);
  });
});
