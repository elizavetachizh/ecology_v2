import { routes } from "../../../../shared/config/routes";
import { useNavigate } from "@tanstack/react-router";
import {
  InstructionForm,
  instructionSavedToast,
} from "../../../../features/waste/upsert-instruction";
import { useTenant } from "../../../../entities/tenant";
import { TenantRequiredGate, toast } from "../../../../shared/ui";

export function CreateInstructionPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description={
        "Создание инструкции доступно после выбора организации в верхней панели."
      }
    >
      <InstructionForm
        mode="create"
        onSaved={(instruction, { close }) => {
          toast.success(instructionSavedToast(true));
          if (close) {
            void navigate({ to: routes.directories.instructions.list });
            return;
          }
          void navigate({
            to: routes.directories.instructions.detail,
            params: { instructionId: instruction.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: routes.directories.instructions.list })}
      />
    </TenantRequiredGate>
  );
}
