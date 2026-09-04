import { describe, expect, it } from "vitest";
import { hasContractsListFilters } from "./has-contracts-list-filters";

describe("hasContractsListFilters", () => {
  it("is false when no list filters are set", () => {
    expect(hasContractsListFilters({})).toBe(false);
    expect(hasContractsListFilters({ q: "" })).toBe(false);
  });

  it("is true for each list filter", () => {
    expect(hasContractsListFilters({ q: "Д-1" })).toBe(true);
    expect(hasContractsListFilters({ status: "active" })).toBe(true);
    expect(hasContractsListFilters({ contract_type: "recycling" })).toBe(true);
    expect(hasContractsListFilters({ counterparty_id: "cp-1" })).toBe(true);
    expect(hasContractsListFilters({ waste_id: "waste-1" })).toBe(true);
  });
});
