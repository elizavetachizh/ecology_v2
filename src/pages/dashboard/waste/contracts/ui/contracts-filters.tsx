import {
  CONTRACT_ALL_STATUS_LABEL,
  CONTRACT_TYPE_LABEL,
  ContractAllStatusValues,
  ContractTypeValues,
  type ContractStatus,
  type ContractType,
} from "../../../../../entities/waste/contracts";
import { CounterpartySelect } from "../../../../../entities/waste/counterparties";
import {
  ListSearchField,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../shared/ui";

export type ContractsFiltersValue = {
  q?: string;
  status?: ContractStatus;
  contract_type?: ContractType;
  counterparty_id?: string;
};

type ContractsFiltersProps = {
  tenantId: string | null;
  values: ContractsFiltersValue;
  onChange: (patch: ContractsFiltersValue) => void;
};

export function ContractsFilters({
  tenantId,
  values,
  onChange,
}: ContractsFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ListSearchField
          value={values.q ?? ""}
          placeholder="Поиск по номеру"
          onSearch={(q) => onChange({ q: q || undefined })}
        />
        <Select
          aria-label="Тип договора"
          className="w-44"
          value={values.contract_type ?? ""}
          onChange={(event) =>
            onChange({
              contract_type: (event.target.value || undefined) as
                | ContractType
                | undefined,
            })
          }
        >
          <option value="">Все типы</option>
          {ContractTypeValues.map((type) => (
            <option key={type} value={type}>
              {CONTRACT_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>

        <div className="w-64">
          <CounterpartySelect
            tenantId={tenantId}
            value={values.counterparty_id ?? ""}
            placeholder="Все контрагенты"
            onChange={(id) => onChange({ counterparty_id: id || undefined })}
          />
        </div>
      </div>
      <Tabs
        value={values.status ?? "all"}
        onValueChange={(value) =>
          onChange({
            status: value === "all" ? undefined : (value as ContractStatus),
          })
        }
        className="gap-0"
      >
        <TabsList aria-label="Статус договора">
          {ContractAllStatusValues.map((status) => (
            <TabsTrigger key={status} value={status}>
              {CONTRACT_ALL_STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
