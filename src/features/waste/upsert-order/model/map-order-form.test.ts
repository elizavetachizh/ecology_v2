import { describe, expect, it } from "vitest";
import { toOrderWriteBody } from "./map-order-form";

const unitId = "550e8400-e29b-41d4-a716-446655440000";

describe("toOrderWriteBody", () => {
  it("sends trimmed number, start_date and unit_id", () => {
    expect(
      toOrderWriteBody({
        number: " 12-ОД ",
        start_date: "2026-01-15",
        unit_id: unitId,
      }),
    ).toEqual({
      number: "12-ОД",
      start_date: "2026-01-15",
      unit_id: unitId,
    });
  });

  it("does not send status", () => {
    expect(
      toOrderWriteBody({
        number: "12-ОД",
        start_date: "2026-01-15",
        unit_id: unitId,
      }),
    ).not.toHaveProperty("status");
  });
});
