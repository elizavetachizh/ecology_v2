import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../../../shared/ui";
import type { Instruction } from "../model/instructions.types";
import { InstructionTabs } from "./InstructionTabs";

type InstructionBindingsTabsProps = {
  loading: boolean;
  error: Error | null;
  instructions: Instruction[];
  value: string;
  onValueChange: (instructionId: string | undefined) => void;
  emptyDescription: ReactNode;
};

/** Loading / error / empty / вкладки — слот для UIW и WIU. */
export function InstructionBindingsTabs({
  loading,
  error,
  instructions,
  value,
  onValueChange,
  emptyDescription,
}: InstructionBindingsTabsProps) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Загрузка инструкций…</p>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить инструкции</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (instructions.length === 0) {
    return (
      <Alert variant="info">
        <AlertTitle>Нет инструкций</AlertTitle>
        <AlertDescription>{emptyDescription}</AlertDescription>
      </Alert>
    );
  }

  return (
    <InstructionTabs
      instructions={instructions}
      value={value}
      onValueChange={(nextId) => onValueChange(nextId || undefined)}
    />
  );
}
