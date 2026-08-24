import { describe, expect, it } from "vitest";
import { toTtnWriteBody } from "./map-ttn-form";

describe("toTtnWriteBody", () => {
  it("trims number and maps required fields", () => {
    expect(
      toTtnWriteBody({
        number: " ТТН-001 ",
        date: "2026-03-15",
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        recycling_contract_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
        status: "active",
      }),
    ).toEqual({
      number: "ТТН-001",
      date: "2026-03-15",
      unit_id: "550e8400-e29b-41d4-a716-446655440000",
      recycling_contract_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
      status: "active",
    });
  });
});
