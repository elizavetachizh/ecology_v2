import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  HAZARD_CLASS_OPTIONS,
  WASTE_UNIT_OPTIONS,
  type DirectoryWaste,
} from "../../../../entities/waste/directory";
import { WasteClassifierSelect } from "../../select-waste-classifier";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { useUpsertWasteForm } from "../model/use-upsert-waste-form";

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

type WasteCatalogFormProps = {
  mode: "create" | "edit";
  wasteId?: string;
  initialInstructionId?: string;
  onCreated?: (waste: DirectoryWaste) => void;
  onUpdated?: (wasteId: string) => void;
  onCancel: () => void;
};

export function WasteCatalogForm({
  mode,
  wasteId,
  initialInstructionId,
  onCreated,
  onUpdated,
  onCancel,
}: WasteCatalogFormProps) {
  const {
    existing,
    instructionId,
    setInstructionId,
    form,
    error,
    pending,
    update,
    handleWasteClassifierChange,
    handleSubmit,
  } = useUpsertWasteForm({
    mode,
    wasteId,
    initialInstructionId,
    onCreated,
    onUpdated,
  });

  if (mode === "edit" && !existing) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert variant="error">
          <AlertDescription>Отход не найден.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link
            to="/directories/wastes"
            search={{ instructionId: instructionId || undefined }}
          >
            К отходам
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <PageContextBar
        eyebrow="Справочники / Отходы"
        title={mode === "create" ? "Новый отход" : form.name || "Отход"}
        description="После сохранения отход можно привязать к журналам ПОД-9 с указанием источника образования."
        actions={
          <Select
            aria-label="Инструкция для отхода"
            value={instructionId}
            onChange={(event) => setInstructionId(event.target.value)}
            disabled={mode === "edit" || instructionId === null}
            className="w-80 max-w-full"
          >
            {instructionId === null ? (
              <option value="">Сначала создайте инструкцию</option>
            ) : (
              <option value="instr-demo-2026">Инструкция 2026</option>
            )}
          </Select>
        }
      />

      <Alert variant="info">
        <AlertTitle>Два шага</AlertTitle>
        <AlertDescription>
          1) Создайте вид отхода в справочнике. 2) При добавлении в журнал ПОД-9
          укажите источник образования — при необходимости его можно создать на
          месте.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        {error ? (
          <Alert variant="error" className="md:col-span-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-classifier">
            Выберите отход из классификатора
          </FieldLabel>
          <WasteClassifierSelect
            value={form.classifierId}
            onChange={handleWasteClassifierChange}
            selectedLabel={
              form.code && form.name ? `${form.code} — ${form.name}` : undefined
            }
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-hazard">Класс опасности</FieldLabel>
          <Select
            id="waste-hazard"
            value={form.hazardClass}
            onChange={(e) => update("hazardClass", e.target.value)}
          >
            {HAZARD_CLASS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-unit">Единица измерения</FieldLabel>
          <Select
            id="waste-unit"
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
          >
            {WASTE_UNIT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать отход"
              : "Сохранить"}
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
    </form>
  );
}
