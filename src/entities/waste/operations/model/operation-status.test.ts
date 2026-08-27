import { describe, expect, it } from "vitest";
import { canMutateOperation, canReviewOperation } from "./operation-status";

describe("canReviewOperation", () => {
  it("is only true for confirmation_required", () => {
    expect(canReviewOperation("confirmation_required")).toBe(true);
    expect(canReviewOperation("pending")).toBe(false);
    expect(canReviewOperation("confirmed")).toBe(false);
    expect(canReviewOperation("declined")).toBe(false);
  });
});

describe("canMutateOperation", () => {
  it("hides edit and delete for declined", () => {
    expect(canMutateOperation("declined")).toBe(false);
    expect(canMutateOperation("confirmed")).toBe(true);
    expect(canMutateOperation("pending")).toBe(true);
    expect(canMutateOperation("confirmation_required")).toBe(true);
  });
});
