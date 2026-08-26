import {
  PASSPORT_ALL_STATUS_LABEL,
  PASSPORT_TRANSPORT_TYPE_LABEL,
  PassportAllStatusValues,
  PassportTransportTypeValues,
  type PassportStatus,
  type PassportTransportType,
} from "../../../../../entities/waste/passports";
import { ContractSelect } from "../../../../../entities/waste/contracts";
import { UnitSelect } from "../../../../../entities/waste/units";
import {
  Input,
  ListSearchField,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../shared/ui";

export type PassportsFiltersValue = {
  q?: string;
  status?: PassportStatus;
  transport_type?: PassportTransportType;
  unit_id?: string;
  recycling_contract_id?: string;
  date_from?: string;
  date_to?: string;
};

type PassportsFiltersProps = {
  tenantId: string | null;
  values: PassportsFiltersValue;
  onChange: (patch: PassportsFiltersValue) => void;
};

export function PassportsFilters({
  tenantId,
  values,
  onChange,
}: PassportsFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ListSearchField
          value={values.q ?? ""}
          placeholder="Поиск по номеру"
          onSearch={(q) => onChange({ q: q || undefined })}
        />
        <div className="w-64">
          <UnitSelect
            tenantId={tenantId}
            value={values.unit_id ?? ""}
            placeholder="Все структурные единицы"
            onChange={(id) => onChange({ unit_id: id || undefined })}
          />
        </div>
        <div className="w-72">
          <ContractSelect
            tenantId={tenantId}
            value={values.recycling_contract_id ?? ""}
            contractType="recycling"
            placeholder="Все договоры утилизации"
            onChange={(id) =>
              onChange({ recycling_contract_id: id || undefined })
            }
          />
        </div>
        <Select
          aria-label="Фильтр по способу перевозки"
          className="w-56"
          value={values.transport_type ?? ""}
          onChange={(event) =>
            onChange({
              transport_type: (event.target.value || undefined) as
                | PassportTransportType
                | undefined,
            })
          }
        >
          <option value="">Все способы перевозки</option>
          {PassportTransportTypeValues.map((type) => (
            <option key={type} value={type}>
              {PASSPORT_TRANSPORT_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">с</span>
          <Input
            type="date"
            aria-label="Дата с"
            className="w-36"
            value={values.date_from ?? ""}
            onChange={(event) =>
              onChange({ date_from: event.target.value || undefined })
            }
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">по</span>
          <Input
            type="date"
            aria-label="Дата по"
            className="w-36"
            value={values.date_to ?? ""}
            onChange={(event) =>
              onChange({ date_to: event.target.value || undefined })
            }
          />
        </div>
      </div>
      <Tabs
        value={values.status ?? "all"}
        onValueChange={(value) =>
          onChange({
            status: value === "all" ? undefined : (value as PassportStatus),
          })
        }
        className="gap-0"
      >
        <TabsList aria-label="Статус паспорта">
          {PassportAllStatusValues.map((status) => (
            <TabsTrigger key={status} value={status}>
              {PASSPORT_ALL_STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
