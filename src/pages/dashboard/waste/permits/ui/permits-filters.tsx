import {
  PERMIT_ALL_STATUS_LABEL,
  PermitAllStatusValues,
  type PermitStatus,
} from "../../../../../entities/waste/permits";
import { UnitSelect } from "../../../../../entities/waste/units";
import {
  ListSearchField,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../shared/ui";

export type PermitsFiltersValue = {
  q?: string;
  status?: PermitStatus;
  unit_id?: string;
};

type PermitsFiltersProps = {
  tenantId: string | null;
  values: PermitsFiltersValue;
  onChange: (patch: PermitsFiltersValue) => void;
};

export function PermitsFilters({
  tenantId,
  values,
  onChange,
}: PermitsFiltersProps) {
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
            placeholder="Все подразделения"
            onChange={(id) => onChange({ unit_id: id || undefined })}
          />
        </div>
      </div>
      <Tabs
        value={values.status ?? "all"}
        onValueChange={(value) =>
          onChange({
            status: value === "all" ? undefined : (value as PermitStatus),
          })
        }
        className="gap-0"
      >
        <TabsList aria-label="Статус разрешения">
          {PermitAllStatusValues.map((status) => (
            <TabsTrigger key={status} value={status}>
              {PERMIT_ALL_STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
