import { describe, expect, it } from "vitest";
import { OperationTypeValues } from "../../entities/waste/operations";
import {
  parseSearchEnum,
  parseSearchIsoDate,
  parseSearchQuery,
} from "./search-params";

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
