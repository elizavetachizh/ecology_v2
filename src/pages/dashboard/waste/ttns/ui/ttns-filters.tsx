import {
  TTN_ALL_STATUS_LABEL,
  TtnAllStatusValues,
  type TtnStatus,
} from "../../../../../entities/waste/ttns";
import { ContractSelect } from "../../../../../entities/waste/contracts";
import { UnitSelect } from "../../../../../entities/waste/units";
import {
  Input,
  ListSearchField,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../shared/ui";

export type TtnsFiltersValue = {
  q?: string;
  status?: TtnStatus;
  unit_id?: string;
  recycling_contract_id?: string;
  date_from?: string;
  date_to?: string;
};

type TtnsFiltersProps = {
  tenantId: string | null;
  values: TtnsFiltersValue;
  onChange: (patch: TtnsFiltersValue) => void;
};

export function TtnsFilters({ tenantId, values, onChange }: TtnsFiltersProps) {
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
            status: value === "all" ? undefined : (value as TtnStatus),
          })
        }
        className="gap-0"
      >
        <TabsList aria-label="Статус ТТН">
          {TtnAllStatusValues.map((status) => (
            <TabsTrigger key={status} value={status}>
              {TTN_ALL_STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
