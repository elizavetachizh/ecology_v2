import { Link } from "@tanstack/react-router";
import { HAZARD_CLASS_LABEL } from "../../../entities/waste/wastes";
import type { UnitInstructionWaste } from "../../../entities/waste/unit-instruction-waste";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../shared/ui";

type Pod9WastesHintProps = {
  unitId: string;
  instructionId: string;
  items: UnitInstructionWaste[];
  total: number;
  loading: boolean;
  error: Error | null;
};

export function Pod9WastesHint({
  unitId,
  instructionId,
  items,
  total,
  loading,
  error,
}: Pod9WastesHintProps) {
  if (!unitId || !instructionId) return null;

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Загрузка отходов привязки…
      </p>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить отходы привязки</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (total === 0) {
    return (
      <Alert variant="info">
        <AlertTitle>Нет отходов в привязке</AlertTitle>
        <AlertDescription>
          Отчёт сформируется с титульным листом без журналов по отходам.{" "}
          <Link
            to="/directories/units/$unitId"
            params={{ unitId }}
            search={{ instructionId }}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Привязать отходы
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const hiddenCount = Math.max(0, total - items.length);

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Отходы в отчёте
        </h3>
        <p className="text-sm text-muted-foreground">
          {total} отходов — по одному листу на каждый. В строки попадут только
          подтверждённые операции за период; остаток на дату окончания берётся с
          сервера.
        </p>
      </div>
      <ul className="grid gap-1 text-sm">
        {items.map((item) => (
          <li key={item.id} className="text-foreground">
            <span className="font-medium">
              {item.waste.waste_classifier.code}
            </span>
            {" · "}
            {item.waste.waste_classifier.name}
            <span className="text-muted-foreground">
              {" · "}
              {HAZARD_CLASS_LABEL[item.waste.hazard_class]}
            </span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          Показаны первые {items.length} из {total}.
        </p>
      ) : null}
    </div>
  );
}
