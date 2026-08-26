import { describe, expect, it } from "vitest";
import { toContractWriteBody } from "./map-contract-form";

describe("toContractWriteBody", () => {
  it("sends empty optionals as null and empty wastes as replace-all list", () => {
    expect(
      toContractWriteBody({
        number: " Д-001 ",
        start_date: "2026-01-15",
        end_date: "",
        contract_type: "transport",
        status: "active",
        counterparty_id: "550e8400-e29b-41d4-a716-446655440000",
        amount: "  ",
        wastes: [
          {
            waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
            cost_per_unit: "",
            label: "Отход",
          },
        ],
      }),
    ).toEqual({
      number: "Д-001",
      start_date: "2026-01-15",
      end_date: null,
      contract_type: "transport",
      status: "active",
      counterparty_id: "550e8400-e29b-41d4-a716-446655440000",
      amount: null,
      wastes: [
        {
          waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
          cost_per_unit: null,
        },
      ],
    });
  });

  it("omits empty draft waste rows from the write body", () => {
    expect(
      toContractWriteBody({
        number: "Д-001",
        start_date: "2026-01-15",
        end_date: "",
        contract_type: "transport",
        status: "active",
        counterparty_id: "550e8400-e29b-41d4-a716-446655440000",
        amount: "",
        wastes: [
          {
            waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
            cost_per_unit: "10",
            label: "Отход",
          },
          { waste_id: "", cost_per_unit: "", label: "" },
        ],
      }).wastes,
    ).toEqual([
      {
        waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
        cost_per_unit: "10",
      },
    ]);
  });
});
