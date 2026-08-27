import type { InstructionStatus } from "../../../../entities/waste/instructions";
import { Alert, AlertDescription, AlertTitle } from "../../../../shared/ui";

type InstructionFormHintProps = {
  mode: "create" | "edit";
  status: InstructionStatus;
};

export function InstructionFormHint({
  mode,
  status,
}: InstructionFormHintProps) {
  if (status === "active") {
    if (mode === "edit") return null;
    return (
      <Alert variant="info">
        <AlertTitle>Документ сразу действует</AlertTitle>
        <AlertDescription>
          Укажите название, дату начала и окончания.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="info">
      <AlertTitle>
        {status === "inactive" ? "Сейчас не действует" : "Черновик"}
      </AlertTitle>
      <AlertDescription>
        Черновик указывается в случае если инструкция находится на согласовании.
        Когда документ готов, смените статус на «Действует» и заполните период,
        затем перейдите к структуре организации.
      </AlertDescription>
    </Alert>
  );
}
