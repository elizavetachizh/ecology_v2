import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  flattenUnitTreePaths,
  formatUnitPathLabel,
  type UnitTree,
} from "../../../entities/waste/units";
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
} from "../../../shared/ui";

type Pod9UnitFieldProps = {
  tree: UnitTree[];
  loading: boolean;
  error: Error | null;
  value: string;
  onChange: (unitId: string) => void;
  disabled?: boolean;
  errorMessage?: string;
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

export function Pod9UnitField({
  tree,
  loading,
  error,
  value,
  onChange,
  disabled = false,
  errorMessage,
}: Pod9UnitFieldProps) {
  const [search, setSearch] = useState("");

  const entries = useMemo(
    () => flattenUnitTreePaths(tree, { pod9Only: true }),
    [tree],
  );

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
    <Field className="md:col-span-2">
      <FieldLabel htmlFor="pod9-unit" required>
        Место учёта
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
        placeholder="Выберите место учёта…"
        searchPlaceholder="Поиск по пути или краткому названию"
        emptyMessage={
          loading
            ? "Загрузка…"
            : query
              ? "Ничего не найдено"
              : "Нет мест учёта ПОД-9. Добавьте место учёта в структуре организации."
        }
        search={search}
        setSearch={setSearch}
        className="w-full"
        contentClassName="w-full"
        aria-label="Место учёта"
        disabled={disabled || loading}
      />
      <FieldDescription>
        Отчёт строится по месту учёта (флаг ПОД-9). Нет нужного?{" "}
        <Link
          to="/directories/units"
          search={{ is_pod9: true }}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Открыть структуру
        </Link>
      </FieldDescription>
      <FieldError>{errorMessage}</FieldError>
    </Field>
  );
}
