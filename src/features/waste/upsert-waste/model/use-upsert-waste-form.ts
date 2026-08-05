import { useState, useSyncExternalStore, type FormEvent } from "react";
import {
  getInstructions,
  subscribeInstructions,
} from "../../../../entities/regulatory-document";
import {
  createWaste,
  emptyWasteForm,
  findWaste,
  updateWaste,
  type DirectoryWaste,
  type WasteFormValues,
} from "../../../../entities/waste/directory";
import type { WasteClassifier } from "../../../../entities/waste/waste-classifier";

type Mode = "create" | "edit";

type UseUpsertWasteFormParams = {
  mode: Mode;
  wasteId?: string;
  initialInstructionId?: string;
  onCreated?: (waste: DirectoryWaste) => void;
  onUpdated?: (wasteId: string) => void;
};

export function useUpsertWasteForm({
  mode,
  wasteId,
  initialInstructionId,
  onCreated,
  onUpdated,
}: UseUpsertWasteFormParams) {
  const instructions = useSyncExternalStore(
    subscribeInstructions,
    getInstructions,
    getInstructions,
  );
  const existing = mode === "edit" && wasteId ? findWaste(wasteId) : null;

  const [instructionId, setInstructionId] = useState(
    existing?.instructionId ??
      initialInstructionId ??
      instructions[0]?.id ??
      "",
  );
  const [form, setForm] = useState<WasteFormValues>(() =>
    existing
      ? {
          classifierId: existing.classifierId,
          code: existing.code,
          name: existing.name,
          hazardClass: existing.hazardClass,
          unit: existing.unit,
        }
      : emptyWasteForm(),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = <K extends keyof WasteFormValues>(
    key: K,
    value: WasteFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleWasteClassifierChange = (item: WasteClassifier | null) => {
    setForm((prev) => ({
      ...prev,
      classifierId: item ? String(item.id) : "",
      code: item?.code ?? null,
      name: item?.name ?? "",
    }));
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!form.classifierId || form.code === null || !form.name.trim()) {
      setError("Выберите отход из классификатора");
      return;
    }
    if (!instructionId) {
      setError("Выберите инструкцию по обращению с отходами");
      return;
    }

    setPending(true);
    try {
      if (mode === "edit" && wasteId) {
        updateWaste(wasteId, form);
        onUpdated?.(wasteId);
        return;
      }

      const created = createWaste(form, instructionId);
      onCreated?.(created);
    } catch {
      setError("Не удалось сохранить отход");
      setPending(false);
    }
  };

  return {
    mode,
    wasteId,
    existing,
    instructions,
    instructionId,
    setInstructionId,
    form,
    error,
    pending,
    update,
    handleWasteClassifierChange,
    handleSubmit,
  };
}
