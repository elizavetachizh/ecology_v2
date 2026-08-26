import { useQuery } from "@tanstack/react-query";
import { AsyncCombobox } from "../../../../shared/ui";
import { getContract } from "../api/get-contract";
import { contractsQueryKeys } from "../model/contracts-query-keys";
import type {
  Contract,
  ContractStatus,
  ContractType,
} from "../model/contracts.types";
import { useContractsOptions } from "../model/use-contracts-query";

type ContractSelectProps = {
  tenantId: string | null;
  value: string;
  contractType: ContractType;
  status?: ContractStatus;
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  onChange: (id: string) => void;
};

function contractLabel(item: Pick<Contract, "number" | "counterparty">) {
  return `${item.number} — ${item.counterparty.name}`;
}

export function ContractSelect({
  tenantId,
  value,
  contractType,
  status = "active",
  disabled,
  placeholder,
  "aria-label": ariaLabel,
  onChange,
}: ContractSelectProps) {
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

  const isRecycling = contractType === "recycling";

  return (
    <AsyncCombobox
      options={contracts.options.map((item) => ({
        value: item.id,
        label: contractLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? contractLabel(selected) : undefined}
      onValueChange={onChange}
      placeholder={
        placeholder ??
        (isRecycling
          ? "Выберите договор утилизации"
          : "Выберите договор перевозки")
      }
      searchPlaceholder="Поиск по номеру"
      emptyMessage={contracts.loading ? "Загрузка…" : "Ничего не найдено"}
      search={contracts.search}
      setSearch={contracts.setSearch}
      disabled={disabled}
      className="w-full"
      contentClassName="w-full"
      aria-label={
        ariaLabel ?? (isRecycling ? "Договор утилизации" : "Договор перевозки")
      }
    />
  );
}
