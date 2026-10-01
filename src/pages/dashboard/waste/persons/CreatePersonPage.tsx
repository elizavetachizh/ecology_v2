import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { PersonForm } from "../../../../features/waste/upsert-person";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function CreatePersonPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание ответственного доступно после выбора организации в верхней панели."
    >
      <PersonForm
        mode="create"
        onSaved={(person, { close }) => {
          toast.success("Ответственный успешно создан");
          if (close) {
            void navigate({ to: routes.directories.persons.list });
            return;
          }
          void navigate({
            to: routes.directories.persons.detail,
            params: { personId: person.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: routes.directories.persons.list })}
      />
    </TenantRequiredGate>
  );
}
