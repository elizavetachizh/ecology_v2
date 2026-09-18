import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { ChevronRight, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { standardUnitLabel } from "../../../../entities/waste/standards";
import { UnitHierarchicalSelect } from "../../../../entities/waste/units";
import { cn } from "../../../../shared/lib/cn";
import { Button, FieldError, FormField } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";
import {
  emptyStandardWasteRow,
  type StandardFormValues,
} from "../model/standard-form.schema";
import { StandardWastesEditor } from "./StandardWastesEditor";

type StandardUnitsEditorProps = {
  form: UseFormReturn<StandardFormValues>;
  tenantId: string | null;
  pending: boolean;
};

export function StandardUnitsEditor({
  form,
  tenantId,
  pending,
}: StandardUnitsEditorProps) {
  const { control, watch, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });
  const units = watch("units") ?? [];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const selectedIds = units.map((unit) => unit.unit_id).filter(Boolean);

  const isExpanded = (unitId: string) => expanded[unitId] === true;

  const toggle = (unitId: string) => {
    setExpanded((prev) => ({ ...prev, [unitId]: !isExpanded(unitId) }));
  };

  return (
    <div className="space-y-3">
      <FormField
        htmlFor="add-standard-unit"
        label="Добавить место учёта"
        description={
          <>
            Нормативы задаются по местам учёта ПОД-9. Нет нужного места учёта?{" "}
            <Link
              to={routes.directories.units.list}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Открыть структуру
            </Link>
          </>
        }
      >
        <UnitHierarchicalSelect
          tenantId={tenantId}
          value=""
          isPod9={true}
          excludeUnitIds={selectedIds}
          aria-label="Место учёта ПОД-9"
          onChange={(unit) => {
            if (!unit || selectedIds.includes(unit.id)) return;
            append({
              unit_id: unit.id,
              unit_label: standardUnitLabel(unit),
              wastes: [{ ...emptyStandardWasteRow }],
            });
          }}
        />
      </FormField>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Добавьте место учёта, чтобы задать нормативы по отходам.
        </p>
      ) : null}

      {fields.map((field, index) => {
        const unit = units[index];
        const unitId = unit?.unit_id ?? field.id;
        const open = isExpanded(unitId);
        const label = unit?.unit_label || "Место учёта";

        return (
          <div
            key={field.id}
            className="overflow-hidden rounded-lg border border-border"
          >
            <div className="flex items-center gap-1 bg-muted/40 px-2 py-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label={open ? `Свернуть ${label}` : `Развернуть ${label}`}
                aria-expanded={open}
                onClick={() => toggle(unitId)}
              >
                <ChevronRight
                  className={cn(
                    "size-4 transition-transform",
                    open && "rotate-90",
                  )}
                />
              </Button>
              <div className="min-w-0 flex-1 text-sm font-medium">{label}</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                aria-label={`Убрать ${label}`}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            {open ? (
              <div className="p-3">
                <StandardWastesEditor
                  form={form}
                  unitIndex={index}
                  tenantId={tenantId}
                  pending={pending}
                />
                <FieldError>
                  {formState.errors.units?.[index]?.unit_id?.message}
                </FieldError>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
