import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../shared/ui";
import type { WasteSource } from "../../../../entities/waste/waste-sources";
import { useUpsertWasteSourceForm } from "../model/use-upsert-waste-source-form";

type WasteSourceFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: WasteSource | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (source: WasteSource) => void;
};

export function WasteSourceFormModal({
  open,
  mode,
  initial,
  onOpenChange,
  onSaved,
}: WasteSourceFormModalProps) {
  const { form, error, pending, onSubmit } = useUpsertWasteSourceForm({
    mode,
    initial,
    open,
    onSaved,
  });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ModalHeader>
            <ModalTitle>
              {mode === "create"
                ? "Новый источник образования"
                : "Изменить источник"}
            </ModalTitle>
            <ModalDescription>
              {mode === "create"
                ? "Источник появится в справочнике организации и будет доступен при привязке отходов."
                : "Измените наименование источника образования."}
            </ModalDescription>
          </ModalHeader>
          <div className="grid gap-3 py-2">
            {error ? (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="grid gap-1.5">
              <Input
                {...register("name")}
                placeholder="Например: Цех №3"
                autoFocus
                disabled={pending}
              />
              {errors.name ? (
                <span className="text-xs text-destructive">
                  {errors.name.message}
                </span>
              ) : null}
            </div>
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Сохранение…"
                : mode === "create"
                  ? "Создать"
                  : "Сохранить"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
