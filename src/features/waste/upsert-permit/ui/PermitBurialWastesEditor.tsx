import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  UOM_LABEL,
  useWastesOptions,
  type WasteBrief,
} from "../../../../entities/waste/wastes";
import {
  AsyncCombobox,
  Button,
  FieldError,
  Input,
} from "../../../../shared/ui";
import {
  emptyPermitBurialWasteRow,
  type PermitFormValues,
} from "../model/permit-form.schema";

type PermitBurialWastesEditorProps = {
  form: UseFormReturn<PermitFormValues>;
  tenantId: string | null;
  pending: boolean;
};

function wasteLabel(waste: Pick<WasteBrief, "waste_classifier">) {
  return `${waste.waste_classifier.code} — ${waste.waste_classifier.name}`;
}

export function PermitBurialWastesEditor({
  form,
  tenantId,
  pending,
}: PermitBurialWastesEditorProps) {
  const { control, register, setValue, watch, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "burial_wastes",
  });
  const rows = watch("burial_wastes");
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
    setValue(`burial_wastes.${index}.waste_id`, wasteId, { shouldDirty: true });
    setValue(
      `burial_wastes.${index}.label`,
      selected ? wasteLabel(selected) : "",
      { shouldDirty: true },
    );
    setValue(
      `burial_wastes.${index}.uomLabel`,
      selected ? UOM_LABEL[selected.uom] : "",
      { shouldDirty: true },
    );
    const otherEmpty = emptyIndexes.some((emptyIndex) => emptyIndex !== index);
    if (wasteId && !otherEmpty) {
      append({ ...emptyPermitBurialWasteRow });
    }
  };

  const removeRow = (index: number) => {
    if (fields.length === 1) {
      setValue("burial_wastes.0.waste_id", "", { shouldDirty: true });
      setValue("burial_wastes.0.label", "", { shouldDirty: true });
      setValue("burial_wastes.0.amount", "", { shouldDirty: true });
      setValue("burial_wastes.0.uomLabel", "", { shouldDirty: true });
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
            <th className="w-56 px-3 py-2 font-medium">Лимит на захоронение</th>
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
                    {...register(`burial_wastes.${index}.waste_id`)}
                  />
                  <input
                    type="hidden"
                    {...register(`burial_wastes.${index}.label`)}
                  />
                  <input
                    type="hidden"
                    {...register(`burial_wastes.${index}.uomLabel`)}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      {...register(`burial_wastes.${index}.amount`)}
                      inputMode="decimal"
                      disabled={pending}
                      aria-label={`Лимит, ${row.label}`}
                    />
                    {row.uomLabel ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {row.uomLabel}
                      </span>
                    ) : null}
                  </div>
                  <FieldError>
                    {formState.errors.burial_wastes?.[index]?.amount?.message}
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
                    {...register(`burial_wastes.${index}.waste_id`)}
                  />
                  <input
                    type="hidden"
                    {...register(`burial_wastes.${index}.label`)}
                  />
                  <input
                    type="hidden"
                    {...register(`burial_wastes.${index}.uomLabel`)}
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
                    aria-label="Отход для лимита захоронения"
                  />
                  <FieldError>
                    {formState.errors.burial_wastes?.[index]?.waste_id?.message}
                  </FieldError>
                </td>
                <td className="px-3 py-2">
                  <Input
                    {...register(`burial_wastes.${index}.amount`)}
                    inputMode="decimal"
                    placeholder="лимит > 0"
                    disabled={pending}
                    aria-label="Лимит на захоронение нового отхода"
                  />
                  <FieldError>
                    {formState.errors.burial_wastes?.[index]?.amount?.message}
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
                onClick={() => append({ ...emptyPermitBurialWasteRow })}
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
