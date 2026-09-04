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
  onChange: (
    id: string,
    item?: Pick<Counterparty, "address" | "contact"> | null,
  ) => void;
};

function resolveCounterparty(
  id: string,
  options: Counterparty[],
  detail: Counterparty | undefined,
): Counterparty | null {
  if (!id) return null;
  return (
    options.find((item) => item.id === id) ??
    (detail?.id === id ? detail : null)
  );
}

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
  const { options, loading, search, setSearch, refetch, refreshing } =
    useCounterpartiesOptions({
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

  const selected = resolveCounterparty(value, options, selectedQuery.data);

  return (
    <AsyncCombobox
      options={options.map((item) => ({
        value: item.id,
        label: counterpartyLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? counterpartyLabel(selected) : undefined}
      onValueChange={(id) => {
        onChange(id, resolveCounterparty(id, options, selectedQuery.data));
      }}
      placeholder={placeholder}
      searchPlaceholder="Поиск по УНП или наименованию"
      emptyMessage={loading ? "Загрузка…" : "Ничего не найдено"}
      search={search}
      setSearch={setSearch}
      disabled={disabled}
      className="w-full"
      contentClassName="w-full"
      aria-label={ariaLabel}
      onRefresh={() => {
        void refetch();
      }}
      refreshing={refreshing}
    />
  );
}
