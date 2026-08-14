import { useNavigate } from "@tanstack/react-router";
import { InstructionForm } from "../../../../features/waste/upsert-instruction";
import { TenantRequiredGate } from "../../../../shared/ui";
import { useTenant } from "../../../../app/providers/tenant/tenant-context";

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
        showNextStepCta
        onSaved={(instruction, { close }) => {
          if (close) {
            void navigate({ to: "/directories/instructions" });
            return;
          }
          void navigate({
            to: "/directories/instructions/$instructionId",
            params: { instructionId: instruction.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: "/directories/instructions" })}
      />
    </TenantRequiredGate>
  );
}
