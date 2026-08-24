import { describe, expect, it } from "vitest";
import { toCounterpartyWriteBody } from "./map-counterparty-form";

describe("toCounterpartyWriteBody", () => {
  it("sends empty optional strings as null", () => {
    expect(
      toCounterpartyWriteBody({
        name: "  Ромашка  ",
        full_name: "  ",
        unp: "",
        address: "  ",
        is_individual: false,
        is_active: true,
      }),
    ).toEqual({
      name: "Ромашка",
      full_name: null,
      unp: null,
      address: null,
      is_individual: false,
      is_active: true,
    });
  });

  it("keeps UNP as a 9-digit string", () => {
    expect(
      toCounterpartyWriteBody({
        name: "Иванов",
        full_name: "Иванов Иван",
        unp: "091234567",
        address: "г. Минск",
        is_individual: true,
        is_active: false,
      }).unp,
    ).toBe("091234567");
  });
});
