import { useEffect } from "react";

type InstructionRef = { id: string };

type UseActiveInstructionIdParams = {
  instructionId?: string;
  instructions: InstructionRef[];
  onInstructionChange: (instructionId: string | undefined) => void;
};

/**
 * Resolves selected instruction from URL/list.
 * If none selected but list is non-empty, syncs the first id via onInstructionChange.
 */
export function useActiveInstructionId({
  instructionId,
  instructions,
  onInstructionChange,
}: UseActiveInstructionIdParams) {
  const activeInstructionId =
    instructionId && instructions.some((item) => item.id === instructionId)
      ? instructionId
      : undefined;

  useEffect(() => {
    if (activeInstructionId || instructions.length === 0) return;
    onInstructionChange(instructions[0]!.id);
  }, [activeInstructionId, instructions, onInstructionChange]);

  return activeInstructionId;
}
