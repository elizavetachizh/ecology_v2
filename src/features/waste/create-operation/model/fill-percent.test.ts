import { describe, expect, it } from "vitest";
import { fillPercent, fillTone, formatFillPercent } from "./fill-percent";

describe("fillPercent", () => {
  it("is balance / transport_unit * 100", () => {
    expect(fillPercent("10", "20")).toBe(50);
    expect(fillPercent("17", "20")).toBe(85);
    expect(fillPercent("18", "20")).toBe(90);
  });

  it("returns null when capacity is missing or zero", () => {
    expect(fillPercent("10", "0")).toBeNull();
    expect(fillPercent("10", "")).toBeNull();
    expect(fillPercent("10", "abc")).toBeNull();
  });

  it("returns null when balance is not a number", () => {
    expect(fillPercent("", "20")).toBeNull();
    expect(fillPercent("-1", "20")).toBeNull();
  });
});

describe("fillTone", () => {
  it("is danger above 85% and warning otherwise", () => {
    expect(fillTone(85)).toBe("warning");
    expect(fillTone(85.1)).toBe("danger");
    expect(fillTone(50)).toBe("warning");
  });
});

describe("formatFillPercent", () => {
  it("formats with up to one fraction digit", () => {
    expect(formatFillPercent(50)).toBe("50");
    expect(formatFillPercent(90.12)).toBe("90,1");
  });
});
