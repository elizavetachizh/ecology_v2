import { describe, expect, it } from "vitest";
import { pickPreferredInstructionId } from "./pick-preferred-instruction";

describe("pickPreferredInstructionId", () => {
  it("returns the first active instruction", () => {
    expect(
      pickPreferredInstructionId([
        { id: "draft", status: "draft" },
        { id: "active-1", status: "active" },
        { id: "active-2", status: "active" },
      ]),
    ).toBe("active-1");
  });

  it("returns undefined when there is no active instruction", () => {
    expect(
      pickPreferredInstructionId([
        { id: "draft", status: "draft" },
        { id: "off", status: "inactive" },
      ]),
    ).toBeUndefined();
  });

  it("returns undefined for an empty list", () => {
    expect(pickPreferredInstructionId([])).toBeUndefined();
  });
});
