import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useActiveInstructionId } from "./use-active-instruction-id";

describe("useActiveInstructionId", () => {
  it("returns instructionId when it exists in the list", () => {
    const onInstructionChange = vi.fn();
    const { result } = renderHook(() =>
      useActiveInstructionId({
        instructionId: "ins-2",
        instructions: [{ id: "ins-1" }, { id: "ins-2" }],
        onInstructionChange,
      }),
    );

    expect(result.current).toBe("ins-2");
    expect(onInstructionChange).not.toHaveBeenCalled();
  });

  it("returns undefined and syncs first id when selection is missing", () => {
    const onInstructionChange = vi.fn();
    const { result } = renderHook(() =>
      useActiveInstructionId({
        instructionId: undefined,
        instructions: [{ id: "ins-1" }, { id: "ins-2" }],
        onInstructionChange,
      }),
    );

    expect(result.current).toBeUndefined();
    expect(onInstructionChange).toHaveBeenCalledWith("ins-1");
  });

  it("returns undefined when instructionId is not in the list", () => {
    const onInstructionChange = vi.fn();
    const { result } = renderHook(() =>
      useActiveInstructionId({
        instructionId: "missing",
        instructions: [{ id: "ins-1" }],
        onInstructionChange,
      }),
    );

    expect(result.current).toBeUndefined();
    expect(onInstructionChange).toHaveBeenCalledWith("ins-1");
  });

  it("does not sync when the list is empty", () => {
    const onInstructionChange = vi.fn();
    const { result } = renderHook(() =>
      useActiveInstructionId({
        instructionId: undefined,
        instructions: [],
        onInstructionChange,
      }),
    );

    expect(result.current).toBeUndefined();
    expect(onInstructionChange).not.toHaveBeenCalled();
  });
});
