/** Куда уйти после успешного save инструкции. */
export type InstructionSaveNext = "open" | "stay" | "list";

/** Что сделать со статусом. */
export type InstructionWriteIntent = "save" | "activate" | "deactivate";

export function instructionSavedToast(
  intent: InstructionWriteIntent,
  isCreate: boolean,
): string {
  if (intent === "activate") return "Инструкция введена в действие";
  if (intent === "deactivate") return "Инструкция снята с действия";
  if (isCreate) return "Инструкция сохранена как черновик";
  return "Инструкция сохранена";
}

