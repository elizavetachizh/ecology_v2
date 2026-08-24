import { describe, expect, it } from "vitest";
import { keepWastesAllowed, syncPassportWastes } from "./keep-wastes-allowed";

describe("keepWastesAllowed", () => {
  it("keeps only wastes that belong to the contract", () => {
    expect(
      keepWastesAllowed(["a", "b", "c"], new Set(["b", "c", "d"])),
    ).toEqual({ kept: ["b", "c"], dropped: ["a"] });
  });

  it("clears all when the new contract has none of the selected wastes", () => {
    expect(keepWastesAllowed(["a", "b"], new Set(["c"]))).toEqual({
      kept: [],
      dropped: ["a", "b"],
    });
  });

  it("drops nothing when the selection is a subset", () => {
    expect(keepWastesAllowed(["a"], new Set(["a", "b"]))).toEqual({
      kept: ["a"],
      dropped: [],
    });
  });
});

describe("syncPassportWastes", () => {
  it("does not drop wastes until the contract list is known", () => {
    expect(syncPassportWastes(["a", "b"], null)).toEqual({
      kept: ["a", "b"],
      dropped: [],
      conflict: false,
    });
  });

  it("flags conflict when selected wastes are outside the contract", () => {
    expect(syncPassportWastes(["a", "b"], ["b"])).toEqual({
      kept: ["b"],
      dropped: ["a"],
      conflict: true,
    });
  });
});
