import { useQuery } from "@tanstack/react-query";
import { AsyncCombobox } from "../../../../shared/ui";
import { getCounterparty } from "../api/get-counterparty";
import { counterpartiesQueryKeys } from "../model/counterparties-query-keys";
import type { Counterparty } from "../model/counterparties.types";
import { useCounterpartiesOptions } from "../model/use-counterparties-query";

type CounterpartySelectProps = {
  tenantId: string | null;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  onChange: (id: string) => void;
};

function counterpartyLabel(item: Pick<Counterparty, "name" | "unp">) {
  return item.unp ? `${item.name} (${item.unp})` : item.name;
}

export function CounterpartySelect({
  tenantId,
  value,
  disabled,
  placeholder = "Выберите контрагента",
  "aria-label": ariaLabel = "Контрагент",
  onChange,
}: CounterpartySelectProps) {
  const { options, loading, search, setSearch } = useCounterpartiesOptions({
    tenantId,
    enabled: Boolean(tenantId),
  });

  const selectedQuery = useQuery({
    queryKey: counterpartiesQueryKeys.detail(
      tenantId ?? "none",
      value || "none",
    ),
    queryFn: ({ signal }) => getCounterparty(value, signal),
    enabled: Boolean(tenantId && value),
  });

  const selected =
    options.find((item) => item.id === value) ??
    (selectedQuery.data?.id === value ? selectedQuery.data : null);

  return (
    <AsyncCombobox
      options={options.map((item) => ({
        value: item.id,
        label: counterpartyLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? counterpartyLabel(selected) : undefined}
      onValueChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Поиск по УНП или наименованию"
      emptyMessage={loading ? "Загрузка…" : "Ничего не найдено"}
      search={search}
      setSearch={setSearch}
      disabled={disabled}
      className="w-full"
      contentClassName="w-full"
      aria-label={ariaLabel}
    />
  );
}
