import { describe, expect, it } from "vitest";
import { OperationTypeValues } from "../../entities/waste/operations";
import { PassportTransportTypeValues } from "../../entities/waste/passports";
import { TtnStatusValues } from "../../entities/waste/ttns";
import { PermitStatusValues } from "../../entities/waste/permits";
import { StandardStatusValues } from "../../entities/waste/standards";
import {
  parseRootSearch,
  parseSearchEnum,
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
