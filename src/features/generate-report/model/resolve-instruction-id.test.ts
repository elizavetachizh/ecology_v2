import { describe, expect, it } from "vitest";
import { resolveReportInstructionId } from "./resolve-instruction-id";

describe("resolveReportInstructionId", () => {
  const instructions = [
    { id: "draft-1", status: "draft" },
    { id: "active-1", status: "active" },
  ];

  it("keeps the current choice while the list is loading", () => {
    expect(resolveReportInstructionId("draft-1", [], true)).toBe("draft-1");
  });

  it("keeps the current choice if it is still in the list", () => {
    expect(resolveReportInstructionId("draft-1", instructions, false)).toBe(
      "draft-1",
    );
  });

  it("prefers an active instruction when nothing is selected", () => {
    expect(resolveReportInstructionId("", instructions, false)).toBe(
      "active-1",
    );
  });

  it("falls back to the first instruction when none is active", () => {
    expect(
      resolveReportInstructionId("", [{ id: "draft-1", status: "draft" }], false),
    ).toBe("draft-1");
  });

  it("clears the choice when the list is empty", () => {
    expect(resolveReportInstructionId("gone", [], false)).toBe("");
  });
});
