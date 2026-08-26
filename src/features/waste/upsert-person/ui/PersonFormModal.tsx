import type { Person } from "../../../../entities/waste/persons";
import {
  Alert,
  AlertDescription,
  Button,
  FormField,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../shared/ui";
import { useUpsertPersonForm } from "../model/use-upsert-person-form";

type PersonFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  personId?: string;
  initial?: Person | null;
  onSaved: (person: Person, meta: { close: boolean }) => void;
  onOpenChange: (open: boolean) => void;
};

export function PersonFormModal({
  open,
  mode,
  personId,
  initial,
  onSaved,
  onOpenChange,
}: PersonFormModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open ? (
        <PersonForm
          key={`${mode}-${personId ?? initial?.id ?? "new"}`}
          mode={mode}
          personId={personId}
          initial={initial}
          onSaved={onSaved}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Modal>
  );
}

type PersonFormProps = Omit<PersonFormModalProps, "open">;

function PersonForm({
  mode,
  personId,
  initial,
  onSaved,
  onOpenChange,
}: PersonFormProps) {
  const { form, error, pending, onSubmit } = useUpsertPersonForm({
    mode,
    personId,
    initial,
    onSaved,
  });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <ModalContent className="max-w-md">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>
            {mode === "create"
              ? "Новый ответственный"
              : "Изменить ответственного"}
          </ModalTitle>
          <ModalDescription>
            {mode === "create"
              ? "Ответственный появится в справочнике организации."
              : "Измените ФИО ответственного."}
          </ModalDescription>
        </ModalHeader>
        <div className="grid gap-3 py-2">
          {error ? (
            <Alert variant="error" className="md:col-span-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <FormField
            htmlFor="name"
            label="ФИО"
            required
            error={errors.name?.message}
          >
            <Input {...register("name")} placeholder="Фамилия Имя Отчество" />
          </FormField>
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
  );
}
