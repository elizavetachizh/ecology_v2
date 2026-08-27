import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { PermitForm } from "../../../../features/waste/upsert-permit";
import { TenantRequiredGate, toast } from "../../../../shared/ui";

export function CreatePermitPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание разрешения доступно после выбора организации в верхней панели."
    >
      <PermitForm
        mode="create"
        onSaved={(permit) => {
          toast.success("Разрешение успешно создано");
          void navigate({
            to: "/directories/permits/$permitId",
            params: { permitId: permit.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: "/directories/permits" })}
      />
    </TenantRequiredGate>
  );
}
