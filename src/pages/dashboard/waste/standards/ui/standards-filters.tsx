import {
  STANDARD_ALL_STATUS_LABEL,
  StandardAllStatusValues,
  type StandardStatus,
} from "../../../../../entities/waste/standards";
import { UnitSelect } from "../../../../../entities/waste/units";
import { Tabs, TabsList, TabsTrigger } from "../../../../../shared/ui";

export type StandardsFiltersValue = {
  status?: StandardStatus;
  unit_id?: string;
};

type StandardsFiltersProps = {
  tenantId: string | null;
  values: StandardsFiltersValue;
  onChange: (patch: StandardsFiltersValue) => void;
};

export function StandardsFilters({
  tenantId,
  values,
  onChange,
}: StandardsFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
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
            status: value === "all" ? undefined : (value as StandardStatus),
          })
        }
        className="gap-0"
      >
        <TabsList aria-label="Статус норматива">
          {StandardAllStatusValues.map((status) => (
            <TabsTrigger key={status} value={status}>
              {STANDARD_ALL_STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
