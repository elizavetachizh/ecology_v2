import {
  VEHICLE_ALL_STATUS_LABEL,
  VehicleAllStatusValues,
  type VehicleStatus,
} from "../../../../../entities/waste/vehicles";
import {
  ListSearchField,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../shared/ui";

export type VehiclesFiltersValue = {
  q?: string;
  status?: VehicleStatus;
};

type VehiclesFiltersProps = {
  values: VehiclesFiltersValue;
  onChange: (patch: VehiclesFiltersValue) => void;
};

export function VehiclesFilters({ values, onChange }: VehiclesFiltersProps) {
  return (
    <>
      <ListSearchField
        value={values.q ?? ""}
        placeholder="По марке, модели или госномеру"
        onSearch={(q) => onChange({ q: q || undefined })}
      />
      <Tabs
        value={values.status ?? "all"}
        onValueChange={(value) =>
          onChange({
            status: value === "all" ? undefined : (value as VehicleStatus),
          })
        }
        className="gap-0"
      >
        <TabsList aria-label="Статус транспортного средства">
          {VehicleAllStatusValues.map((status) => (
            <TabsTrigger key={status} value={status}>
              {VEHICLE_ALL_STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
