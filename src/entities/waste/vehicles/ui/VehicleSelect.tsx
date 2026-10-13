import { useQuery } from "@tanstack/react-query";
import { AsyncCombobox } from "../../../../shared/ui";
import { getVehicle } from "../api/get-vehicle";
import { vehiclesQueryKeys } from "../model/vehicles-query-keys";
import type { Vehicle } from "../model/vehicles.types";
import { useVehiclesOptions } from "../model/use-vehicles-query";

type VehicleSelectProps = {
  tenantId: string | null;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  onChange: (id: string) => void;
};

function vehicleLabel(item: Pick<Vehicle, "make" | "model" | "license_plate">) {
  return `${item.make} ${item.model} — ${item.license_plate}`;
}

export function VehicleSelect({
  tenantId,
  value,
  disabled,
  placeholder = "Выберите транспорт",
  "aria-label": ariaLabel = "Транспорт",
  onChange,
}: VehicleSelectProps) {
  const vehicles = useVehiclesOptions({
    tenantId,
    enabled: Boolean(tenantId),
  });

  const selectedQuery = useQuery({
    queryKey: vehiclesQueryKeys.detail(tenantId ?? "none", value || "none"),
    queryFn: ({ signal }) => getVehicle(value, signal),
    enabled: Boolean(tenantId && value),
  });

  const selected =
    vehicles.options.find((item) => item.id === value) ??
    (selectedQuery.data?.id === value ? selectedQuery.data : null);

  return (
    <AsyncCombobox
      options={vehicles.options.map((item) => ({
        value: item.id,
        label: vehicleLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? vehicleLabel(selected) : undefined}
      onValueChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Поиск по марке или номеру"
      emptyMessage={vehicles.loading ? "Загрузка…" : "Ничего не найдено"}
      search={vehicles.search}
      setSearch={vehicles.setSearch}
      disabled={disabled}
      className="w-full"
      contentClassName="w-full"
      aria-label={ariaLabel}
      onRefresh={() => {
        void vehicles.refetch();
      }}
      refreshing={vehicles.refreshing}
    />
  );
}
