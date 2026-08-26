type InstructionStatusRef = {
  id: string;
  status: string;
};

/** First active instruction, if any. Draft/inactive are not auto-selected. */
export function pickPreferredInstructionId(
  instructions: InstructionStatusRef[],
): string | undefined {
  return instructions.find((item) => item.status === "active")?.id;
}

/** Keep an explicit choice when it is still in the list; otherwise the preferred id. */
export function resolveInstructionId(
  selectedId: string | undefined,
  instructions: InstructionStatusRef[],
  loading: boolean,
): string | undefined {
  if (selectedId && instructions.some((item) => item.id === selectedId)) {
    return selectedId;
  }
  if (loading) return undefined;
  return pickPreferredInstructionId(instructions);
}
