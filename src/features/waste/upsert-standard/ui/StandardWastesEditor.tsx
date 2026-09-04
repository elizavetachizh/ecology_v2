import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  UOM_LABEL,
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
  emptyStandardWasteRow,
  type StandardFormValues,
} from "../model/standard-form.schema";

type StandardWastesEditorProps = {
  form: UseFormReturn<StandardFormValues>;
  tenantId: string | null;
  pending: boolean;
};

export function StandardWastesEditor({
  form,
  tenantId,
  pending,
}: StandardWastesEditorProps) {
  const { control, register, setValue, watch, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "wastes",
  });
  const rows = watch("wastes");
  const wastes = useWastesOptions({
    tenantId,
    enabled: Boolean(tenantId),
    limit: 50,
  });

  const filledIndexes = fields
    .map((_, index) => index)
    .filter((index) => Boolean(rows[index]?.waste_id));
  const emptyIndexes = fields
    .map((_, index) => index)
    .filter((index) => !rows[index]?.waste_id);

  const selectedIds = new Set(
    rows.filter((item) => item.waste_id).map((item) => item.waste_id),
  );

  const setRowWaste = (index: number, wasteId: string) => {
    const selected = wastes.options.find((item) => item.id === wasteId);
    setValue(`wastes.${index}.waste_id`, wasteId, { shouldDirty: true });
    setValue(`wastes.${index}.label`, selected ? wasteLabel(selected) : "", {
      shouldDirty: true,
    });
    setValue(
      `wastes.${index}.uomLabel`,
      selected ? UOM_LABEL[selected.uom] : "",
      { shouldDirty: true },
    );
    const otherEmpty = emptyIndexes.some((emptyIndex) => emptyIndex !== index);
    if (wasteId && !otherEmpty) {
      append({ ...emptyStandardWasteRow });
    }
  };

  const removeRow = (index: number) => {
    if (fields.length === 1) {
      setValue("wastes.0.waste_id", "", { shouldDirty: true });
      setValue("wastes.0.label", "", { shouldDirty: true });
      setValue("wastes.0.amount", "", { shouldDirty: true });
      setValue("wastes.0.uomLabel", "", { shouldDirty: true });
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
            <th className="w-56 px-3 py-2 font-medium">Норматив образования</th>
            <th className="w-12 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {filledIndexes.map((index) => {
            const item = fields[index];
            const row = rows[index];
            return (
              <tr key={item.id} className="border-t border-border">
                <td className="px-3 py-2">{row.label}</td>
                <td className="px-3 py-2">
                  <input
                    type="hidden"
                    {...register(`wastes.${index}.waste_id`)}
                  />
                  <input type="hidden" {...register(`wastes.${index}.label`)} />
                  <input
                    type="hidden"
                    {...register(`wastes.${index}.uomLabel`)}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      {...register(`wastes.${index}.amount`)}
                      inputMode="decimal"
                      disabled={pending}
                      aria-label={`Норматив, ${row.label}`}
                    />
                    {row.uomLabel ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {row.uomLabel}
                      </span>
                    ) : null}
                  </div>
                  <FieldError>
                    {formState.errors.wastes?.[index]?.amount?.message}
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
            const row = rows[index];
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
                  <input
                    type="hidden"
                    {...register(`wastes.${index}.uomLabel`)}
                  />
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
                    aria-label="Отход для норматива образования"
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
                    {...register(`wastes.${index}.amount`)}
                    inputMode="decimal"
                    placeholder="норматив > 0"
                    disabled={pending}
                    aria-label="Норматив образования нового отхода"
                  />
                  <FieldError>
                    {formState.errors.wastes?.[index]?.amount?.message}
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
                disabled={pending || emptyIndexes.length > 0}
                onClick={() => append({ ...emptyStandardWasteRow })}
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
