import { describe, expect, it } from "vitest";
import { toPersonWriteBody } from "./map-person-form";

describe("toPersonWriteBody", () => {
  it("sends empty FIO and beltopgas as null and keeps an empty unit list", () => {
    expect(
      toPersonWriteBody({
        name: "Иванов Иван",
        first_name: "  ",
        last_name: "",
        middle_name: "",
        beltopgas_uuid: "  ",
        unit_ids: [],
      }),
    ).toEqual({
      name: "Иванов Иван",
      first_name: null,
      last_name: null,
      middle_name: null,
      beltopgas_uuid: null,
      unit_ids: [],
    });
  });

  it("keeps filled FIO, beltopgas and unit_ids in order", () => {
    expect(
      toPersonWriteBody({
        name: "Иванов Иван",
        first_name: "Иван",
        last_name: "Иванов",
        middle_name: "Иванович",
        beltopgas_uuid: "btg-1",
        unit_ids: ["unit-2", "unit-1"],
      }),
    ).toEqual({
      name: "Иванов Иван",
      first_name: "Иван",
      last_name: "Иванов",
      middle_name: "Иванович",
      beltopgas_uuid: "btg-1",
      unit_ids: ["unit-2", "unit-1"],
    });
  });
});
