import { useQuery } from "@tanstack/react-query";
import {
  contractsQueryKeys,
  getContract,
  useContractsOptions,
  type Contract,
  type ContractStatus,
  type ContractType,
} from "../../../../entities/waste/contracts";
import { AsyncCombobox } from "../../../../shared/ui";

type PassportContractSelectProps = {
  tenantId: string | null;
  value: string;
  contractType: ContractType;
  status?: ContractStatus;
  disabled?: boolean;
  placeholder?: string;
  onChange: (id: string) => void;
};

function contractLabel(item: Pick<Contract, "number" | "counterparty">) {
  return `${item.number} — ${item.counterparty.name}`;
}

export function PassportContractSelect({
  tenantId,
  value,
  contractType,
  status = "active",
  disabled,
  placeholder,
  onChange,
}: PassportContractSelectProps) {
  const contracts = useContractsOptions({
    tenantId,
    enabled: Boolean(tenantId),
    contract_type: contractType,
    status,
  });

  const selectedQuery = useQuery({
    queryKey: contractsQueryKeys.detail(tenantId ?? "none", value || "none"),
    queryFn: ({ signal }) => getContract(value, signal),
    enabled: Boolean(tenantId && value),
  });

  const selected =
    contracts.options.find((item) => item.id === value) ??
    (selectedQuery.data?.id === value ? selectedQuery.data : null);

  const defaultPlaceholder =
    contractType === "recycling"
      ? "Выберите договор утилизации"
      : "Выберите договор перевозки";

  return (
    <AsyncCombobox
      options={contracts.options.map((item) => ({
        value: item.id,
        label: contractLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? contractLabel(selected) : undefined}
      onValueChange={onChange}
      placeholder={placeholder ?? defaultPlaceholder}
      searchPlaceholder="Поиск по номеру"
      emptyMessage={contracts.loading ? "Загрузка…" : "Ничего не найдено"}
      search={contracts.search}
      setSearch={contracts.setSearch}
      disabled={disabled}
      className="w-full"
      contentClassName="w-full"
      aria-label={
        contractType === "recycling"
          ? "Договор утилизации"
          : "Договор перевозки"
      }
    />
  );
}
