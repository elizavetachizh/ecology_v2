import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  flattenUnitTreePaths,
  formatUnitPathLabel,
  type UnitBrief,
  type UnitTree,
} from "../../../../entities/waste/units";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AsyncCombobox,
  Badge,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

type OperationUnitPickerProps = {
  tenantId: string | null;
  tree: UnitTree[];
  loading: boolean;
  error: Error | null;
  value: string;
  onChange: (unitId: string) => void;
  fallbackUnit?: UnitBrief | null;
  excludeUnitId?: string;
  disabled?: boolean;
  errorMessage?: string;
  htmlFor?: string;
  label?: string;
  placeholder?: string;
  "aria-label"?: string;
  description?: ReactNode;
};

function renderPod9UnitOption(option: { value: string; label: string }) {
  return (
    <>
      <span className="min-w-0 flex-1 whitespace-normal break-words">
        {option.label}
      </span>
      <Badge variant="info" className="shrink-0 self-start">
        ПОД-9
      </Badge>
    </>
  );
}

export function OperationUnitPicker({
  tenantId,
  tree,
  loading,
  error,
  value,
  onChange,
  fallbackUnit,
  excludeUnitId,
  disabled = false,
  errorMessage,
  htmlFor = "unit_id",
  label = "Место учёта",
  placeholder = "Выберите место учёта…",
  "aria-label": ariaLabel = "Место учёта",
  description,
}: OperationUnitPickerProps) {
  const [search, setSearch] = useState("");

  const entries = useMemo(() => {
    const all = flattenUnitTreePaths(tree, { pod9Only: true });
    return excludeUnitId
      ? all.filter((item) => item.unit.id !== excludeUnitId)
      : all;
  }, [tree, excludeUnitId]);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return entries;
    return entries.filter((item) => {
      const pathLabel = formatUnitPathLabel(item.path).toLowerCase();
      const shortName = item.unit.short_name?.toLowerCase() ?? "";
      return pathLabel.includes(query) || shortName.includes(query);
    });
  }, [entries, query]);

  const selected = entries.find((item) => item.unit.id === value);
  const selectedLabel = selected
    ? formatUnitPathLabel(selected.path)
    : fallbackUnit?.id === value
      ? fallbackUnit.name
      : undefined;

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить структуру</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Field>
      <FieldLabel htmlFor={htmlFor} required>
        {label}
      </FieldLabel>
      <AsyncCombobox
        options={filtered.map((item) => ({
          value: item.unit.id,
          label: formatUnitPathLabel(item.path),
        }))}
        value={value}
        selectedLabel={selectedLabel}
        renderOption={(option) => renderPod9UnitOption(option)}
        renderValue={(option) => renderPod9UnitOption(option)}
        onValueChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Поиск по пути или краткому названию"
        emptyMessage={
          loading
            ? "Загрузка…"
            : query
              ? "Ничего не найдено"
              : "Нет журналов ПОД-9. Добавьте журнал в структуре организации."
        }
        search={search}
        setSearch={setSearch}
        className="w-full"
        contentClassName="w-full"
        aria-label={ariaLabel}
        disabled={disabled || loading}
      />
      <FieldDescription>
        {description ?? (
          <>
            Нет нужного места учёта?{" "}
            <Link
              to={routes.directories.units.list}
              search={tenantId ? { tenant: tenantId } : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Открыть структуру
            </Link>
          </>
        )}
      </FieldDescription>
      <FieldError>{errorMessage}</FieldError>
    </Field>
  );
}
