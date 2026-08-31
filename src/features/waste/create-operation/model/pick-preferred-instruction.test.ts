import { describe, expect, it } from "vitest";
import {
  pickPreferredInstructionId,
  resolveInstructionId,
} from "./pick-preferred-instruction";

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

describe("resolveInstructionId", () => {
  const list = [
    { id: "draft", status: "draft" },
    { id: "active-1", status: "active" },
  ];

  it("keeps an explicit selection that is still in the list", () => {
    expect(resolveInstructionId("draft", list, false)).toBe("draft");
  });

  it("falls back to preferred when selection is missing and loaded", () => {
    expect(resolveInstructionId(undefined, list, false)).toBe("active-1");
    expect(resolveInstructionId("gone", list, false)).toBe("active-1");
  });

  it("does not fall back while the list is loading", () => {
    expect(resolveInstructionId(undefined, [], true)).toBeUndefined();
    expect(resolveInstructionId("gone", list, true)).toBeUndefined();
  });
});
