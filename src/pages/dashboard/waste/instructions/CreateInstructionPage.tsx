import { useNavigate } from "@tanstack/react-router";
import { InstructionForm } from "../../../../features/waste/upsert-instruction";
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
        showNextStepCta
        onSaved={(instruction, { close }) => {
          toast.success("Инструкция успешно создана");
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
