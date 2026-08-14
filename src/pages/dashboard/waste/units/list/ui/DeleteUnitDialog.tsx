import type { Unit } from "../../../../../../entities/waste/units";
import { ConfirmDialog } from "../../../../../../shared/ui";

type DeleteUnitDialogProps = {
  unit: Unit | null;
  confirmDisabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteUnitDialog({
  unit,
  confirmDisabled,
  onOpenChange,
  onConfirm,
}: DeleteUnitDialogProps) {
  return (
    <ConfirmDialog
      open={unit !== null}
      confirmDisabled={confirmDisabled}
      onOpenChange={onOpenChange}
      title="Удалить структурную единицу?"
      description={
        unit ? (
          <>
            Единица «{unit.name}» будет удалена. Убедитесь, что нет зависимых
            данных.
          </>
        ) : null
      }
      onConfirm={onConfirm}
    />
  );
}
