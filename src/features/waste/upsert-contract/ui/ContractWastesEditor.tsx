import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  useWastesOptions,
  wasteLabel,
} from "../../../../entities/waste/wastes";
import {
  AsyncCombobox,
  Button,
  FieldError,
  Input,
} from "../../../../shared/ui";
import {
  emptyContractWasteRow,
  type ContractFormValues,
} from "../model/contract-form.schema";

type ContractWastesEditorProps = {
  form: UseFormReturn<ContractFormValues>;
  tenantId: string | null;
  pending: boolean;
};

export function ContractWastesEditor({
  form,
  tenantId,
  pending,
}: ContractWastesEditorProps) {
  const { control, register, setValue, watch, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "wastes",
  });
  const wastesValue = watch("wastes");
  const wastes = useWastesOptions({
    tenantId,
    enabled: Boolean(tenantId),
    limit: 50,
  });

  const filledIndexes = fields
    .map((_, index) => index)
    .filter((index) => Boolean(wastesValue[index]?.waste_id));
  const emptyIndexes = fields
    .map((_, index) => index)
    .filter((index) => !wastesValue[index]?.waste_id);

  const selectedIds = new Set(
    wastesValue.filter((item) => item.waste_id).map((item) => item.waste_id),
  );

  const setRowWaste = (index: number, wasteId: string) => {
    const selected = wastes.options.find((item) => item.id === wasteId);
    setValue(`wastes.${index}.waste_id`, wasteId, { shouldDirty: true });
    setValue(`wastes.${index}.label`, selected ? wasteLabel(selected) : "", {
      shouldDirty: true,
    });
    const otherEmpty = emptyIndexes.some((emptyIndex) => emptyIndex !== index);
    if (wasteId && !otherEmpty) {
      append({ ...emptyContractWasteRow });
    }
  };

  const removeRow = (index: number) => {
    if (fields.length === 1) {
      setValue("wastes.0.waste_id", "", { shouldDirty: true });
      setValue("wastes.0.label", "", { shouldDirty: true });
      setValue("wastes.0.cost_per_unit", "", { shouldDirty: true });
      return;
    }
    remove(index);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Отход</th>
            <th className="w-48 px-3 py-2 font-medium">Стоимость за единицу</th>
            <th className="w-12 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {filledIndexes.map((index) => {
            const item = fields[index];
            const row = wastesValue[index];
            return (
              <tr key={item.id} className="border-t border-border">
                <td className="px-3 py-2">{row.label}</td>
                <td className="px-3 py-2">
                  <input
                    type="hidden"
                    {...register(`wastes.${index}.waste_id`)}
                  />
                  <input type="hidden" {...register(`wastes.${index}.label`)} />
                  <Input
                    {...register(`wastes.${index}.cost_per_unit`)}
                    inputMode="decimal"
                    placeholder="необязательно"
                    disabled={pending}
                    aria-label={`Стоимость за единицу, ${row.label}`}
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
                    aria-label={`Убрать ${row.label}`}
                    onClick={() => removeRow(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            );
          })}
          {emptyIndexes.map((index) => {
            const item = fields[index];
            const row = wastesValue[index];
            const addable = wastes.options.filter(
              (option) =>
                !selectedIds.has(option.id) || option.id === row.waste_id,
            );
            const selected = addable.find(
              (option) => option.id === row.waste_id,
            );

            return (
              <tr key={item.id} className="border-t border-border">
                <td className="min-w-64 px-3 py-2">
                  <input
                    type="hidden"
                    {...register(`wastes.${index}.waste_id`)}
                  />
                  <input type="hidden" {...register(`wastes.${index}.label`)} />
                  <AsyncCombobox
                    options={addable.map((option) => ({
                      value: option.id,
                      label: wasteLabel(option),
                    }))}
                    value={row.waste_id}
                    selectedLabel={selected ? wasteLabel(selected) : undefined}
                    onValueChange={(wasteId) => setRowWaste(index, wasteId)}
                    placeholder="Выберите отход"
                    searchPlaceholder="Поиск по коду или названию"
                    emptyMessage={
                      wastes.loading ? "Загрузка…" : "Ничего не найдено"
                    }
                    search={wastes.search}
                    setSearch={wastes.setSearch}
                    disabled={pending}
                    className="w-full"
                    contentClassName="w-full"
                    aria-label="Отход для перечня"
                    onRefresh={() => {
                      void wastes.refetch();
                    }}
                    refreshing={wastes.refreshing}
                  />
                  <FieldError>
                    {formState.errors.wastes?.[index]?.waste_id?.message}
                  </FieldError>
                </td>
                <td className="px-3 py-2">
                  <Input
                    {...register(`wastes.${index}.cost_per_unit`)}
                    inputMode="decimal"
                    placeholder="необязательно"
                    disabled={pending}
                    aria-label="Стоимость за единицу нового отхода"
                  />
                  <FieldError>
                    {formState.errors.wastes?.[index]?.cost_per_unit?.message}
                  </FieldError>
                </td>
                <td className="px-3 py-2 text-right">
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      aria-label="Убрать строку отхода"
                      onClick={() => removeRow(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/30">
            <td colSpan={3} className="p-0">
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => append({ ...emptyContractWasteRow })}
                className="h-10 w-full justify-start rounded-none px-3 font-normal"
              >
                <Plus className="size-4" />
                Добавить отход
              </Button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
