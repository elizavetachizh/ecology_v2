import { Link } from "@tanstack/react-router";
import type { InstructionStatus } from "../../../../entities/waste/instructions";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "../../../../shared/ui";
import { InstructionNextStepCta } from "./InstructionNextStepCta";

type InstructionFormHintProps = {
  mode: "create" | "edit";
  status: InstructionStatus;
};

export function InstructionFormHint({ mode, status }: InstructionFormHintProps) {
  if (mode === "create") {
    return (
      <Alert variant="info" className="md:col-span-2">
        <AlertTitle>Сохраняется как черновик</AlertTitle>
        <AlertDescription>
          Нажмите «Создать». На следующей карточке можно указать период и ввести
          инструкцию в действие, затем перейти к структуре организации.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "active") {
    return (
      <div className="md:col-span-2">
        <InstructionNextStepCta />
      </div>
    );
  }

  return (
    <Alert variant="info" className="md:col-span-2">
      <AlertTitle>
        {status === "inactive" ? "Сейчас не действует" : "Это черновик"}
      </AlertTitle>
      <AlertDescription>
        <p>
          Укажите дату начала и окончания, затем нажмите «Ввести в действие».
          После этого можно заполнять{" "}
          <Button asChild variant="link" className="h-auto p-0 text-sm">
            <Link to="/directories/units">структуру организации</Link>
          </Button>
          .
        </p>
      </AlertDescription>
    </Alert>
  );
}
