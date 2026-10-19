import { useState } from "react";
import {
  useFieldArray,
  type FieldPath,
  type UseFormReturn,
} from "react-hook-form";
import { Plus, Search, Trash2, X } from "lucide-react";
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
  emptyPermitLimitWasteRow,
  type PermitFormValues,
} from "../model/permit-form.schema";

type LimitField = "burial_wastes" | "storage_wastes";
type LimitKey = "waste_id" | "amount" | "label" | "uomLabel";

const LIMIT_COPY = {
  burial_wastes: {
    amountHeader: "Лимит на захоронение",
    filledAmount: (label: string) => `Лимит на захоронение, ${label}`,
    emptyAmount: "Лимит на захоронение нового отхода",
    waste: "Отход для лимита захоронения",
    search: "Поиск среди отходов на захоронение",
  },
  storage_wastes: {
    amountHeader: "Лимит на хранение",
    filledAmount: (label: string) => `Лимит на хранение, ${label}`,
    emptyAmount: "Лимит на хранение нового отхода",
    waste: "Отход для лимита хранения",
    search: "Поиск среди отходов на хранение",
  },
} as const;

function matchesAddedWaste(label: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return label.toLowerCase().includes(needle);
}

function limitPath(
  name: LimitField,
  index: number,
  key: LimitKey,
): FieldPath<PermitFormValues> {
  return `${name}.${index}.${key}` as FieldPath<PermitFormValues>;
}

type PermitLimitWastesEditorProps = {
  form: UseFormReturn<PermitFormValues>;
  tenantId: string | null;
  pending: boolean;
  name: LimitField;
};

export function PermitLimitWastesEditor({
  form,
  tenantId,
  pending,
  name,
}: PermitLimitWastesEditorProps) {
  const copy = LIMIT_COPY[name];
  const [query, setQuery] = useState("");
  const { control, register, setValue, watch, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });
  const rows = watch(name);
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

  const setRowField = (index: number, key: LimitKey, value: string) => {
    setValue(limitPath(name, index, key), value, { shouldDirty: true });
  };

  const setRowWaste = (index: number, wasteId: string) => {
    const selected = wastes.options.find((item) => item.id === wasteId);
    setRowField(index, "waste_id", wasteId);
    setRowField(index, "label", selected ? wasteLabel(selected) : "");
    setRowField(index, "uomLabel", selected ? UOM_LABEL[selected.uom] : "");
    const otherEmpty = emptyIndexes.some((emptyIndex) => emptyIndex !== index);
    if (wasteId && !otherEmpty) {
      append({ ...emptyPermitLimitWasteRow });
    }
  };

  const removeRow = (index: number) => {
    if (fields.length === 1) {
      setRowField(0, "waste_id", "");
      setRowField(0, "label", "");
      setRowField(0, "amount", "");
      setRowField(0, "uomLabel", "");
      return;
    }
    remove(index);
  };

  const rowErrors = formState.errors[name];
  const visibleFilledIndexes = filledIndexes.filter((index) => {
    const row = rows[index];
    if (!row) return false;
    if (matchesAddedWaste(row.label, query)) return true;
    const errors = rowErrors?.[index];
    return Boolean(errors?.amount || errors?.waste_id);
  });
  const visibleFilled = new Set(visibleFilledIndexes);

  return (
    <>
      <div className="relative max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.search}
          aria-label={copy.search}
          disabled={pending}
          className="px-8"
        />
        {query ? (
          <button
            type="button"
            aria-label="Очистить поиск"
            className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => setQuery("")}
          >
            <X aria-hidden className="size-3.5" />
          </button>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Отход</th>
              <th className="w-56 px-3 py-2 font-medium">
                {copy.amountHeader}
              </th>
              <th className="w-12 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {query.trim() && visibleFilledIndexes.length === 0 ? (
              <tr className="border-t border-border">
                <td colSpan={3} className="px-3 py-3 text-muted-foreground">
                  Ничего не найдено
                </td>
              </tr>
            ) : null}
            {filledIndexes.map((index) => {
              const item = fields[index];
              const row = rows[index];
              return (
                <tr
                  key={item.id}
                  hidden={!visibleFilled.has(index)}
                  className="border-t border-border"
                >
                  <td className="px-3 py-2">{row.label}</td>
                  <td className="px-3 py-2">
                    <input
                      type="hidden"
                      {...register(limitPath(name, index, "waste_id"))}
                    />
                    <input
                      type="hidden"
                      {...register(limitPath(name, index, "label"))}
                    />
                    <input
                      type="hidden"
                      {...register(limitPath(name, index, "uomLabel"))}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        {...register(limitPath(name, index, "amount"))}
                        inputMode="decimal"
                        disabled={pending}
                        aria-label={copy.filledAmount(row.label)}
                      />
                      {row.uomLabel ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {row.uomLabel}
                        </span>
                      ) : null}
                    </div>
                    <FieldError>
                      {rowErrors?.[index]?.amount?.message}
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
                      {...register(limitPath(name, index, "waste_id"))}
                    />
                    <input
                      type="hidden"
                      {...register(limitPath(name, index, "label"))}
                    />
                    <input
                      type="hidden"
                      {...register(limitPath(name, index, "uomLabel"))}
                    />
                    <AsyncCombobox
                      options={addable.map((option) => ({
                        value: option.id,
                        label: wasteLabel(option),
                      }))}
                      value={row.waste_id}
                      selectedLabel={
                        selected ? wasteLabel(selected) : undefined
                      }
                      onValueChange={(wasteId) => setRowWaste(index, wasteId)}
                      placeholder="Выберите отход"
                      searchPlaceholder="Поиск по коду или названию"
                      emptyMessage={
                        wastes.loading ? "Загрузка…" : "Ничего не найдено"
                      }
                      search={wastes.search}
                      onRefresh={() => {
                        void wastes.refetch();
                      }}
                      refreshing={wastes.refreshing}
                      setSearch={wastes.setSearch}
                      disabled={pending}
                      className="w-full"
                      contentClassName="w-full"
                      aria-label={copy.waste}
                    />
                    <FieldError>
                      {rowErrors?.[index]?.waste_id?.message}
                    </FieldError>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      {...register(limitPath(name, index, "amount"))}
                      inputMode="decimal"
                      placeholder="лимит > 0"
                      disabled={pending}
                      aria-label={copy.emptyAmount}
                    />
                    <FieldError>
                      {rowErrors?.[index]?.amount?.message}
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
                  onClick={() => append({ ...emptyPermitLimitWasteRow })}
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
    </>
  );
}
