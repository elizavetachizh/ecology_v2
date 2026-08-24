import {
  PASSPORT_STATUS_LABEL,
  PASSPORT_TRANSPORT_TYPE_LABEL,
  PassportStatusValues,
  PassportTransportTypeValues,
  type PassportStatus,
  type PassportTransportType,
} from "../../../../../entities/waste/passports";
import {
  PassportContractSelect,
  PassportUnitSelect,
} from "../../../../../features/waste/upsert-passport";
import { Input, ListSearchField, Select } from "../../../../../shared/ui";

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
    <div className="flex flex-wrap items-center gap-2">
      <ListSearchField
        value={values.q ?? ""}
        placeholder="Поиск по номеру"
        onSearch={(q) => onChange({ q: q || undefined })}
      />
      <div className="w-64">
        <PassportUnitSelect
          tenantId={tenantId}
          value={values.unit_id ?? ""}
          placeholder="Все структурные единицы"
          onChange={(id) => onChange({ unit_id: id || undefined })}
        />
      </div>
      <div className="w-72">
        <PassportContractSelect
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
      <Select
        aria-label="Фильтр по статусу"
        className="w-44"
        value={values.status ?? ""}
        onChange={(event) =>
          onChange({
            status: (event.target.value || undefined) as
              | PassportStatus
              | undefined,
          })
        }
      >
        <option value="">Все статусы</option>
        {PassportStatusValues.map((status) => (
          <option key={status} value={status}>
            {PASSPORT_STATUS_LABEL[status]}
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
  );
}
