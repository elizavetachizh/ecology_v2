import { describe, expect, it } from "vitest";
import { wasteLabel } from "./waste-label";

describe("wasteLabel", () => {
  it("joins classifier code and name", () => {
    expect(
      wasteLabel({
        waste_classifier: { id: 1, code: 1010100, name: "Test waste" },
      }),
    ).toBe("1010100 — Test waste");
  });
});
