type InstructionStatusRef = {
  id: string;
  status: string;
};

type WasteIdRef = {
  waste_id: string;
};

/** First active instruction, if any. Draft/inactive are not auto-selected. */
export function pickPreferredInstructionId(
  instructions: InstructionStatusRef[],
): string | undefined {
  return instructions.find((item) => item.status === "active")?.id;
}

/** Instruction that currently binds this waste; prefer an active one if several match. */
export function pickInstructionIdOwningWaste(
  instructions: InstructionStatusRef[],
  wasteId: string,
  wastesByInstructionId: ReadonlyMap<string, readonly WasteIdRef[]>,
): string | undefined {
  const owners = instructions.filter((instruction) =>
    wastesByInstructionId
      .get(instruction.id)
      ?.some((item) => item.waste_id === wasteId),
  );
  return pickPreferredInstructionId(owners) ?? owners[0]?.id;
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
