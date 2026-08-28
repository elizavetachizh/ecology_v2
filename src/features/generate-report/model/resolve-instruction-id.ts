type InstructionRef = {
  id: string;
  status: string;
};

/**
 * Keep the current choice if it is still in the list.
 * Otherwise prefer an active instruction, then the first one.
 */
export function resolveReportInstructionId(
  selectedId: string,
  instructions: InstructionRef[],
  loading: boolean,
): string {
  if (loading) return selectedId;
  if (selectedId && instructions.some((item) => item.id === selectedId)) {
    return selectedId;
  }
  return (
    instructions.find((item) => item.status === "active")?.id ??
    instructions[0]?.id ??
    ""
  );
}
