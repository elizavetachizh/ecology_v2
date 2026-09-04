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
        contact: "  ",
        is_individual: false,
        is_active: true,
      }),
    ).toEqual({
      name: "Ромашка",
      full_name: null,
      unp: null,
      address: null,
      contact: null,
      is_individual: false,
      is_active: true,
    });
  });

  it("keeps UNP as a 9-digit string and contact as text", () => {
    const body = toCounterpartyWriteBody({
      name: "Иванов",
      full_name: "Иванов Иван",
      unp: "091234567",
      address: "г. Минск",
      contact: "+375 17 000-00-00",
      is_individual: true,
      is_active: false,
    });
    expect(body.unp).toBe("091234567");
    expect(body.contact).toBe("+375 17 000-00-00");
  });
});
