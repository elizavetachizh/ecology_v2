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
