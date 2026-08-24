import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Trash2 } from "lucide-react";
import {
  useWastesOptions,
  type WasteBrief,
} from "../../../../entities/waste/wastes";
import {
  AsyncCombobox,
  Button,
  FieldError,
  Input,
} from "../../../../shared/ui";
import type { ContractFormValues } from "../model/contract-form.schema";

type ContractWastesEditorProps = {
  form: UseFormReturn<ContractFormValues>;
  tenantId: string | null;
  pending: boolean;
};

function wasteLabel(waste: Pick<WasteBrief, "waste_classifier">) {
  return `${waste.waste_classifier.code} — ${waste.waste_classifier.name}`;
}

export function ContractWastesEditor({
  form,
  tenantId,
  pending,
}: ContractWastesEditorProps) {
  const { control, register, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "wastes",
  });
  const [pendingWasteId, setPendingWasteId] = useState("");
  const wastes = useWastesOptions({
    tenantId,
    enabled: Boolean(tenantId),
    limit: 50,
  });

  const selectedIds = new Set(fields.map((item) => item.waste_id));
  const addable = wastes.options.filter((item) => !selectedIds.has(item.id));
  const pendingWaste = addable.find((item) => item.id === pendingWasteId);

  const addWaste = () => {
    if (!pendingWaste) return;
    append({
      waste_id: pendingWaste.id,
      cost_per_unit: "",
      label: wasteLabel(pendingWaste),
    });
    setPendingWasteId("");
    wastes.setSearch("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-64 flex-1">
          <AsyncCombobox
            options={addable.map((item) => ({
              value: item.id,
              label: wasteLabel(item),
            }))}
            value={pendingWasteId}
            selectedLabel={pendingWaste ? wasteLabel(pendingWaste) : undefined}
            onValueChange={setPendingWasteId}
            placeholder="Добавить отход из справочника"
            searchPlaceholder="Поиск по коду или названию"
            emptyMessage={wastes.loading ? "Загрузка…" : "Ничего не найдено"}
            search={wastes.search}
            setSearch={wastes.setSearch}
            disabled={pending}
            className="w-full"
            contentClassName="w-full"
            aria-label="Отход для перечня"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={pending || !pendingWasteId}
          onClick={addWaste}
        >
          Добавить в перечень
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Перечень пуст. Для сопроводительного паспорта в договоре утилизации
          нужен хотя бы один отход.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Отход</th>
                <th className="w-48 px-3 py-2 font-medium">
                  Стоимость за единицу
                </th>
                <th className="w-12 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {fields.map((item, index) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2">{item.label}</td>
                  <td className="px-3 py-2">
                    <input
                      type="hidden"
                      {...register(`wastes.${index}.waste_id`)}
                    />
                    <input
                      type="hidden"
                      {...register(`wastes.${index}.label`)}
                    />
                    <Input
                      {...register(`wastes.${index}.cost_per_unit`)}
                      inputMode="decimal"
                      placeholder="необязательно"
                      disabled={pending}
                      aria-label={`Стоимость за единицу, ${item.label}`}
                    />
                    <FieldError>
                      {formState.errors.wastes?.[index]?.cost_per_unit?.message}
                    </FieldError>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      aria-label={`Убрать ${item.label}`}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
