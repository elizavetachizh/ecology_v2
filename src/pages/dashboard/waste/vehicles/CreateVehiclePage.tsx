import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { VehicleForm } from "../../../../features/waste/upsert-vehicle";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function CreateVehiclePage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание транспортного средства доступно после выбора организации в верхней панели."
    >
      <VehicleForm
        mode="create"
        onSaved={(vehicle, { close }) => {
          toast.success("Транспортное средство успешно создано");
          if (close) {
            void navigate({ to: routes.directories.vehicles.list });
            return;
          }
          void navigate({
            to: routes.directories.vehicles.detail,
            params: { vehicleId: vehicle.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: routes.directories.vehicles.list })}
      />
    </TenantRequiredGate>
  );
}
