import { describe, expect, it } from "vitest";
import { toTtnUpdateBody, toTtnWriteBody } from "./map-ttn-form";

const values = {
  number: " ТТН-001 ",
  date: "2026-03-15",
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
  recycling_contract_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
};

describe("toTtnWriteBody", () => {
  it("trims number, maps required fields and always sends active", () => {
    expect(toTtnWriteBody(values)).toEqual({
      number: "ТТН-001",
      date: "2026-03-15",
      unit_id: "550e8400-e29b-41d4-a716-446655440000",
      recycling_contract_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
      status: "active",
    });
  });
});

describe("toTtnUpdateBody", () => {
  it("omits status so PATCH does not change it", () => {
    expect(toTtnUpdateBody(values)).not.toHaveProperty("status");
  });
});
