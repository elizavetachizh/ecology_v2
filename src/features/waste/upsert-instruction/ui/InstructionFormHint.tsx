import { Link } from "@tanstack/react-router";
import type { InstructionStatus } from "../../../../entities/waste/instructions";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "../../../../shared/ui";

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
          Укажите дату начала и окончания. Без периода статус «Действует»
          сохранить нельзя.
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
        Даты можно указать позже. Когда документ готов, смените статус на
        «Действует» и заполните период, затем перейдите к{" "}
        <Button asChild variant="link" className="h-auto p-0 text-sm">
          <Link to="/directories/units">структуре организации</Link>
        </Button>
        .
      </AlertDescription>
    </Alert>
  );
}
