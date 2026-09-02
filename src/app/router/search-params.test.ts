import { describe, expect, it } from "vitest";
import { OperationTypeValues } from "../../entities/waste/operations";
import { PassportTransportTypeValues } from "../../entities/waste/passports";
import { TtnStatusValues } from "../../entities/waste/ttns";
import { PermitStatusValues } from "../../entities/waste/permits";
import { StandardStatusValues } from "../../entities/waste/standards";
import { OrderStatusValues } from "../../entities/waste/orders";
import {
  parseHomeSearch,
  parseRootSearch,
  parseSearchEnum,
  parseSearchIntRange,
  parseSearchIsoDate,
  parseSearchQuery,
} from "./search-params";

describe("parseRootSearch", () => {
  it("parses tenant from search", () => {
    expect(parseRootSearch({ tenant: "org-1" })).toEqual({ tenant: "org-1" });
    expect(parseRootSearch({ tenant: "  " })).toEqual({ tenant: undefined });
    expect(parseRootSearch({})).toEqual({ tenant: undefined });
  });
});

describe("parseHomeSearch", () => {
  it("parses as-of date, selection and months range", () => {
    expect(
      parseHomeSearch({
        on_date: "2026-08-15",
        unit_id: "unit-1",
        waste_id: "waste-1",
        months: "12",
      }),
    ).toEqual({
      on_date: "2026-08-15",
      unit_id: "unit-1",
      waste_id: "waste-1",
      months: 12,
    });
  });

  it("drops broken date and months outside 1…24", () => {
    expect(
      parseHomeSearch({
        on_date: "15.08.2026",
        months: 48,
      }),
    ).toEqual({
      on_date: undefined,
      unit_id: undefined,
      waste_id: undefined,
      months: undefined,
    });
  });
});

describe("parseSearchIntRange", () => {
  it("accepts integers inside the inclusive range", () => {
    expect(parseSearchIntRange("6", 1, 24)).toBe(6);
    expect(parseSearchIntRange(12, 1, 24)).toBe(12);
    expect(parseSearchIntRange("24", 1, 24)).toBe(24);
  });

  it("rejects empty, out of range and non-numeric values", () => {
    expect(parseSearchIntRange("", 1, 24)).toBeUndefined();
    expect(parseSearchIntRange("0", 1, 24)).toBeUndefined();
    expect(parseSearchIntRange("25", 1, 24)).toBeUndefined();
    expect(parseSearchIntRange("abc", 1, 24)).toBeUndefined();
  });
});

describe("parseSearchIsoDate", () => {
  it("accepts YYYY-MM-DD", () => {
    expect(parseSearchIsoDate("2026-03-01")).toBe("2026-03-01");
  });

  it("rejects empty, malformed and non-string values", () => {
    expect(parseSearchIsoDate("")).toBeUndefined();
    expect(parseSearchIsoDate("01.03.2026")).toBeUndefined();
    expect(parseSearchIsoDate("2026-3-1")).toBeUndefined();
    expect(parseSearchIsoDate(20260301)).toBeUndefined();
  });
});

describe("operations search params", () => {
  it("parses operation_type enum and optional ids", () => {
    expect(parseSearchEnum("formed", OperationTypeValues)).toBe("formed");
    expect(parseSearchEnum("used", OperationTypeValues)).toBe("used");
    expect(parseSearchEnum("export", OperationTypeValues)).toBeUndefined();
    expect(parseSearchQuery("unit-1")).toBe("unit-1");
    expect(parseSearchQuery("  ")).toBeUndefined();
  });
});

describe("passports search params", () => {
  it("parses transport_type enum", () => {
    expect(parseSearchEnum("self", PassportTransportTypeValues)).toBe("self");
    expect(
      parseSearchEnum("transport_contract", PassportTransportTypeValues),
    ).toBe("transport_contract");
    expect(
      parseSearchEnum("carrier", PassportTransportTypeValues),
    ).toBeUndefined();
  });
});

describe("ttns search params", () => {
  it("parses status enum", () => {
    expect(parseSearchEnum("active", TtnStatusValues)).toBe("active");
    expect(parseSearchEnum("inactive", TtnStatusValues)).toBe("inactive");
    expect(parseSearchEnum("draft", TtnStatusValues)).toBeUndefined();
  });
});

describe("permits search params", () => {
  it("parses status enum", () => {
    expect(parseSearchEnum("active", PermitStatusValues)).toBe("active");
    expect(parseSearchEnum("inactive", PermitStatusValues)).toBe("inactive");
    expect(parseSearchEnum("draft", PermitStatusValues)).toBeUndefined();
  });
});

describe("standards search params", () => {
  it("parses status enum", () => {
    expect(parseSearchEnum("active", StandardStatusValues)).toBe("active");
    expect(parseSearchEnum("inactive", StandardStatusValues)).toBe("inactive");
    expect(parseSearchEnum("draft", StandardStatusValues)).toBeUndefined();
  });
});

describe("orders search params", () => {
  it("parses status enum", () => {
    expect(parseSearchEnum("active", OrderStatusValues)).toBe("active");
    expect(parseSearchEnum("inactive", OrderStatusValues)).toBe("inactive");
    expect(parseSearchEnum("draft", OrderStatusValues)).toBeUndefined();
  });
});
