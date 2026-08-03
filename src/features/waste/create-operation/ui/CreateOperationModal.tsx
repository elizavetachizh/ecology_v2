import { useState, type ReactNode } from "react";
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
  Select,
} from "../../../../shared/ui";
import { getAllWastes } from "../../../../pages/dashboard/directories/model/pod9-wastes.store";
import { listStructureUnits } from "../../../../pages/dashboard/directories/model/structure.store";
import {
  CREATE_OPERATION_STEPS,
  OPERATION_TYPES,
  createEmptyOperationForm,
  type CreateOperationForm,
} from "../model/mocks";

type CreateOperationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CreateOperationForm) => void;
};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

export function CreateOperationModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateOperationModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CreateOperationForm>(createEmptyOperationForm);
  const [error, setError] = useState<string | null>(null);

  const structureUnits = listStructureUnits();
  const wastes = getAllWastes();
  const selectedWaste = wastes.find((item) => item.id === form.wasteId);

  const reset = () => {
    setStep(1);
    setForm(createEmptyOperationForm());
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const updateField = <K extends keyof CreateOperationForm>(
    key: K,
    value: CreateOperationForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1 && !form.unitId) {
      setError("Выберите структурную единицу");
      return false;
    }

    if (currentStep === 2 && (!form.wasteId || !selectedWaste)) {
      setError("Выберите отход");
      return false;
    }

    if (currentStep === 3) {
      if (!form.date) {
        setError("Укажите дату операции");
        return false;
      }
      if (!form.operationTypeId) {
        setError("Выберите тип операции");
        return false;
      }
      const quantity = Number(form.quantity);
      if (!form.quantity || Number.isNaN(quantity) || quantity <= 0) {
        setError("Количество должно быть больше 0");
        return false;
      }
    }

    setError(null);
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(prev + 1, CREATE_OPERATION_STEPS.length));
  };

  const goBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    onSubmit?.(form);
    handleOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-xl">
        <ModalHeader>
          <ModalTitle>Создание операции</ModalTitle>
          <ModalDescription>
            Шаг {step} из {CREATE_OPERATION_STEPS.length}:{" "}
            {CREATE_OPERATION_STEPS[step - 1]?.title}
          </ModalDescription>
        </ModalHeader>

        <div className="flex gap-2">
          {CREATE_OPERATION_STEPS.map((item) => (
            <div
              key={item.id}
              className={`h-1.5 flex-1 rounded-full ${
                item.id <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {error ? (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <Alert variant="info">
              <AlertDescription>
                Выберите структурную единицу из иерархии организации.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <FieldLabel htmlFor="structure-unit">
                Структурная единица
              </FieldLabel>
              <Select
                id="structure-unit"
                className="w-full"
                value={form.unitId}
                onChange={(event) => updateField("unitId", event.target.value)}
              >
                <option value="">Выберите структурную единицу</option>
                {structureUnits.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.code ? ` (${item.code})` : ""}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="waste">Отход</FieldLabel>
              <Select
                id="waste"
                className="w-full"
                value={form.wasteId}
                onChange={(event) => updateField("wasteId", event.target.value)}
              >
                <option value="">Выберите отход</option>
                {wastes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>

            {selectedWaste ? (
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Класс опасности: </span>
                  {selectedWaste.hazardClass}
                </div>
                <div>
                  <span className="text-muted-foreground">Ед. изм.: </span>
                  {selectedWaste.unit}
                </div>
                <div>
                  <span className="text-muted-foreground">Источник: </span>
                  {selectedWaste.source}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="operation-date">Дата операции</FieldLabel>
              <Input
                id="operation-date"
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="operation-type">Тип операции</FieldLabel>
              <Select
                id="operation-type"
                className="w-full"
                value={form.operationTypeId}
                onChange={(event) =>
                  updateField("operationTypeId", event.target.value)
                }
              >
                <option value="">Выберите тип</option>
                {OPERATION_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="quantity">
                Количество
                {selectedWaste ? ` (${selectedWaste.unit})` : ""}
              </FieldLabel>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
              />
            </div>
          </div>
        ) : null}

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Отмена
          </Button>
          {step > 1 ? (
            <Button type="button" variant="secondary" onClick={goBack}>
              Назад
            </Button>
          ) : null}
          {step < CREATE_OPERATION_STEPS.length ? (
            <Button type="button" onClick={goNext}>
              Далее
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              Создать операцию
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
