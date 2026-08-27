import { describe, expect, it } from "vitest";
import {
  pickInstructionIdOwningWaste,
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

describe("pickInstructionIdOwningWaste", () => {
  const instructions = [
    { id: "draft", status: "draft" },
    { id: "active-other", status: "active" },
    { id: "active-owner", status: "active" },
  ];

  it("returns the active instruction that binds the waste", () => {
    const wastes = new Map([
      ["draft", [{ waste_id: "waste-1" }]],
      ["active-other", [{ waste_id: "waste-2" }]],
      ["active-owner", [{ waste_id: "waste-1" }]],
    ]);
    expect(pickInstructionIdOwningWaste(instructions, "waste-1", wastes)).toBe(
      "active-owner",
    );
  });

  it("falls back to a non-active owner when no active match exists", () => {
    const wastes = new Map([
      ["draft", [{ waste_id: "waste-1" }]],
      ["active-other", [{ waste_id: "waste-2" }]],
    ]);
    expect(pickInstructionIdOwningWaste(instructions, "waste-1", wastes)).toBe(
      "draft",
    );
  });

  it("returns undefined when no instruction binds the waste", () => {
    const wastes = new Map([["active-other", [{ waste_id: "waste-2" }]]]);
    expect(
      pickInstructionIdOwningWaste(instructions, "waste-1", wastes),
    ).toBeUndefined();
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
