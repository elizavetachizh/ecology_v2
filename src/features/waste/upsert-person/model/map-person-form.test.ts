import { describe, expect, it } from "vitest";
import { toPersonWriteBody } from "./map-person-form";

describe("toPersonWriteBody", () => {
  it("sends empty beltopgas_uuid and FIO as null", () => {
    expect(
      toPersonWriteBody({
        name: "Иванов Иван",
        first_name: "  ",
        last_name: "",
        middle_name: undefined,
        beltopgas_uuid: "  ",
      }),
    ).toEqual({
      name: "Иванов Иван",
      first_name: null,
      last_name: null,
      middle_name: null,
      beltopgas_uuid: null,
    });
  });

  it("keeps filled beltopgas_uuid", () => {
    expect(
      toPersonWriteBody({
        name: "Иванов Иван",
        first_name: "Иван",
        last_name: "Иванов",
        middle_name: "Иванович",
        beltopgas_uuid: "btg-1",
      }).beltopgas_uuid,
    ).toBe("btg-1");
  });
});
