import type { InstructionStatus } from "../../../../entities/waste/instructions";
import { Alert, AlertDescription, AlertTitle } from "../../../../shared/ui";

type InstructionFormHintProps = {
  status: InstructionStatus;
};

export function InstructionFormHint({ status }: InstructionFormHintProps) {
  if (status === "active") {
    return null;
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
