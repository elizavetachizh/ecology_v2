import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../shared/ui";
import type { Counterparty } from "../../../../entities/waste/counterparties";
import { useUpsertCounterpartyForm } from "../model/use-upsert-counterparty-form";
import { CounterpartyFormFields } from "./CounterpartyFormFields";

type CounterpartyFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Counterparty | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (counterparty: Counterparty) => void;
};

export function CounterpartyFormModal({
  open,
  mode,
  initial,
  onOpenChange,
  onSaved,
}: CounterpartyFormModalProps) {
  const { form, error, pending, onSubmit } = useUpsertCounterpartyForm({
    mode,
    initial,
    open,
    onSaved,
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ModalHeader>
            <ModalTitle>
              {mode === "create"
                ? "Новый контрагент"
                : "Изменить контрагента"}
            </ModalTitle>
            <ModalDescription>
              {mode === "create"
                ? "Контрагент появится в справочнике организации."
                : "Измените реквизиты контрагента."}
            </ModalDescription>
          </ModalHeader>
          <CounterpartyFormFields form={form} pending={pending} error={error} />
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
