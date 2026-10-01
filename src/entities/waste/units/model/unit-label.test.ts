import { describe, expect, it } from "vitest";
import { unitLabel } from "./unit-label";

describe("unitLabel", () => {
  it("uses short_name when present", () => {
    expect(unitLabel({ name: "Цех №1", short_name: "Ц1" })).toBe("Ц1");
  });

  it("falls back to name when short_name is null", () => {
    expect(unitLabel({ name: "Цех №1", short_name: null })).toBe("Цех №1");
  });

  it("falls back to name when short_name is empty", () => {
    expect(unitLabel({ name: "Цех №1", short_name: "" })).toBe("Цех №1");
  });
});
