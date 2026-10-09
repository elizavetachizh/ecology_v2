import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getVehicle,
  vehiclesQueryKeys,
} from "../../../../entities/waste/vehicles";
import { VehicleForm } from "../../../../features/waste/upsert-vehicle";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditVehiclePage() {
  const { vehicleId } = useParams({
    from: routes.directories.vehicles.detail,
  });
  const navigate = useNavigate({
    from: routes.directories.vehicles.detail,
  });
  const { activeTenantId } = useTenant();

  const vehicleQuery = useQuery({
    queryKey: vehiclesQueryKeys.detail(activeTenantId ?? "none", vehicleId),
    queryFn: ({ signal }) => getVehicle(vehicleId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (vehicleQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (vehicleQuery.isError || !vehicleQuery.data) {
    return (
      <AlertDetailPageError
        directoryTo={routes.directories.vehicles.list}
        linkLabel="К транспортным средствам"
        description="Транспортное средство не найдено."
      />
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть транспортное средство, выберите организацию в верхней панели."
    >
      <VehicleForm
        mode="edit"
        vehicleId={vehicleId}
        initial={vehicleQuery.data}
        onSaved={(_vehicle, { close }) => {
          toast.success("Транспортное средство успешно обновлено");
          if (close) void navigate({ to: routes.directories.vehicles.list });
        }}
        onCancel={() => void navigate({ to: routes.directories.vehicles.list })}
      />
    </TenantRequiredGate>
  );
}
