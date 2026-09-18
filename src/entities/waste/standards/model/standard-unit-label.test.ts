import { describe, expect, it } from "vitest";
import { standardUnitFixture } from "./standard.fixture";
import { standardUnitLabel } from "./standards.types";

describe("standardUnitLabel", () => {
  it("uses name and short_name when present", () => {
    expect(standardUnitLabel(standardUnitFixture.unit)).toBe("Цех №1 (Ц1)");
  });

  it("falls back to name", () => {
    expect(
      standardUnitLabel({ ...standardUnitFixture.unit, short_name: null }),
    ).toBe("Цех №1");
  });
});
