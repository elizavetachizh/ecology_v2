import { useState } from "react";
import { FormProvider } from "react-hook-form";
import type { Operation } from "../../../../entities/waste/operations";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../shared/ui";
import {
  STEP_TRIGGER_FIELDS,
  UPSERT_OPERATION_STEPS,
  resetAfterUnitChange,
} from "../model/operation-wizard";
import { useUpsertOperationForm } from "../model/use-upsert-operation-form";
import { OperationStepBinding } from "./steps/OperationStepBinding";
import { OperationStepDate } from "./steps/OperationStepDate";
import { OperationStepDetails } from "./steps/OperationStepDetails";
import { OperationStepUnit } from "./steps/OperationStepUnit";

type CreateOperationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (operation: Operation) => void;
};

export function CreateOperationModal({
  open,
  onOpenChange,
  onSaved,
}: CreateOperationModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open ? (
        <CreateOperationModalForm
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
}

type CreateOperationModalFormProps = Omit<CreateOperationModalProps, "open">;

function CreateOperationModalForm({
  onOpenChange,
  onSaved,
}: CreateOperationModalFormProps) {
  const [step, setStep] = useState(1);
  const [selectedInstructionId, setSelectedInstructionId] = useState<
    string | undefined
  >();
  const { form, error, pending, onSubmit } = useUpsertOperationForm({
    mode: "create",
    onSaved,
  });
  const lastStep = step >= UPSERT_OPERATION_STEPS.length;

  const goNext = async () => {
    const fields =
      STEP_TRIGGER_FIELDS[step as keyof typeof STEP_TRIGGER_FIELDS];
    const valid = await form.trigger(fields);
    if (valid) setStep((prev) => prev + 1);
  };

  const goBack = () => {
    form.clearErrors();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <FormProvider {...form}>
      <ModalContent className="max-w-xl">
        <form
          onSubmit={
            lastStep
              ? form.handleSubmit(onSubmit)
              : (event) => {
                  event.preventDefault();
                  void goNext();
                }
          }
        >
          <ModalHeader>
            <ModalTitle>Создание операции</ModalTitle>
            <ModalDescription>
              Шаг {step} из {UPSERT_OPERATION_STEPS.length}:{" "}
              {UPSERT_OPERATION_STEPS[step - 1]?.title}
            </ModalDescription>
          </ModalHeader>

          <div className="flex gap-2">
            {UPSERT_OPERATION_STEPS.map((item) => (
              <div
                key={item.id}
                className={`h-1.5 flex-1 rounded-full ${
                  item.id <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="grid gap-4 py-2">
            {error ? (
              <Alert variant="error">
                <AlertTitle>Не удалось сохранить</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {step === 1 ? <OperationStepDate pending={pending} /> : null}
            {step === 2 ? (
              <OperationStepUnit
                pending={pending}
                onUnitChange={() => {
                  setSelectedInstructionId(undefined);
                  resetAfterUnitChange(form.setValue);
                }}
              />
            ) : null}
            {step === 3 ? (
              <OperationStepBinding
                mode="create"
                pending={pending}
                selectedInstructionId={selectedInstructionId}
                onInstructionIdChange={setSelectedInstructionId}
              />
            ) : null}
            {step === 4 ? (
              <OperationStepDetails
                pending={pending}
                instructionId={selectedInstructionId}
              />
            ) : null}
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
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={goBack}
              >
                Назад
              </Button>
            ) : null}
            {lastStep ? (
              <Button type="submit" disabled={pending}>
                {pending ? "Сохранение…" : "Создать операцию"}
              </Button>
            ) : (
              <Button type="submit" disabled={pending}>
                Далее
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </FormProvider>
  );
}
