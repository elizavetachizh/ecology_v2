import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { StandardForm } from "../../../../features/waste/upsert-standard";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function CreateStandardPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return ( 
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание норматива доступно после выбора организации в верхней панели."
    >
      <StandardForm
        mode="create"
        onSaved={(standard, { close }) => {
          toast.success("Норматив успешно создан");
          if(close){
            void navigate({ to: routes.directories.standards.list });
            return;
          }
          void navigate({
            to: routes.directories.standards.detail,
            params: { standardId: standard.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: routes.directories.standards.list })}
      />
    </TenantRequiredGate>
  );
}
