import {
  STANDARD_ALL_STATUS_LABEL,
  StandardAllStatusValues,
  type StandardStatus,
} from "../../../../../entities/waste/standards";
import { UnitHierarchicalSelect } from "../../../../../entities/waste/units";
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
          <UnitHierarchicalSelect
            tenantId={tenantId}
            value={values.unit_id ?? ""}
            isPod9={true}
            onChange={(unit) => onChange({ unit_id: unit?.id ?? undefined })}
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
