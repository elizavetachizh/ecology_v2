import { Button } from "../../../../shared/ui";

type UnitFormActionsProps = {
  mode: "create" | "edit";
  pending: boolean;
  onSaveAndClose: () => void;
  onCancel: () => void;
};

export function UnitFormActions({
  mode,
  pending,
  onSaveAndClose,
  onCancel,
}: UnitFormActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="submit" disabled={pending}>
        {pending
          ? "Сохранение…"
          : mode === "create"
            ? "Создать единицу"
            : "Сохранить изменения"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={onSaveAndClose}
      >
        Сохранить и закрыть
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={onCancel}
      >
        Отмена
      </Button>
    </div>
  );
}
