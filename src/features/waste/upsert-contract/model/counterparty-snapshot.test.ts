import { describe, expect, it, vi } from "vitest";
import {
  applyCounterpartySnapshot,
  counterpartySnapshotFields,
} from "./counterparty-snapshot";

describe("counterpartySnapshotFields", () => {
  it("copies address and contact from the counterparty", () => {
    expect(
      counterpartySnapshotFields({
        address: "г. Минск, ул. Ленина, 1",
        contact: "+375 17 000-00-00",
      }),
    ).toEqual({
      counterparty_address: "г. Минск, ул. Ленина, 1",
      counterparty_contact: "+375 17 000-00-00",
    });
  });

  it("uses empty strings when the counterparty or fields are missing", () => {
    expect(counterpartySnapshotFields(null)).toEqual({
      counterparty_address: "",
      counterparty_contact: "",
    });
    expect(
      counterpartySnapshotFields({ address: null, contact: null }),
    ).toEqual({
      counterparty_address: "",
      counterparty_contact: "",
    });
  });
});

describe("applyCounterpartySnapshot", () => {
  it("writes both snapshot fields", () => {
    const setValue = vi.fn();
    applyCounterpartySnapshot(setValue, {
      address: "г. Минск",
      contact: "+375",
    });
    expect(setValue).toHaveBeenCalledWith("counterparty_address", "г. Минск");
    expect(setValue).toHaveBeenCalledWith("counterparty_contact", "+375");
  });
});
