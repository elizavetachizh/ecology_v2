import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { PermitForm } from "../../../../features/waste/upsert-permit";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

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
        onSaved={(permit, { close }) => {
          toast.success("Разрешение успешно создано");
          if (close) {
            void navigate({ to: routes.directories.permits.list });
            return;
          }
          void navigate({
            to: routes.directories.permits.detail,
            params: { permitId: permit.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: routes.directories.permits.list })}
      />
    </TenantRequiredGate>
  );
}
