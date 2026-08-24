import { useQuery } from "@tanstack/react-query";
import {
  counterpartiesQueryKeys,
  getCounterparty,
  useCounterpartiesOptions,
  type Counterparty,
} from "../../../../entities/waste/counterparties";
import { AsyncCombobox } from "../../../../shared/ui";

type PassportCounterpartySelectProps = {
  tenantId: string | null;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (id: string) => void;
};

function counterpartyLabel(item: Pick<Counterparty, "name" | "unp">) {
  return item.unp ? `${item.name} (${item.unp})` : item.name;
}

export function PassportCounterpartySelect({
  tenantId,
  value,
  disabled,
  placeholder = "Необязательно — только активные",
  onChange,
}: PassportCounterpartySelectProps) {
  const counterparties = useCounterpartiesOptions({
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
    counterparties.options.find((item) => item.id === value) ??
    (selectedQuery.data?.id === value ? selectedQuery.data : null);

  return (
    <AsyncCombobox
      options={counterparties.options.map((item) => ({
        value: item.id,
        label: counterpartyLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? counterpartyLabel(selected) : undefined}
      onValueChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Поиск по УНП или наименованию"
      emptyMessage={
        counterparties.loading ? "Загрузка…" : "Ничего не найдено"
      }
      search={counterparties.search}
      setSearch={counterparties.setSearch}
      disabled={disabled}
      className="w-full"
      contentClassName="w-full"
      aria-label="Производитель отходов"
    />
  );
}
