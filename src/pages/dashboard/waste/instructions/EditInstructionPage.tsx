import { useNavigate, useParams } from "@tanstack/react-router";
import {
  InstructionForm,
  instructionSavedToast,
} from "../../../../features/waste/upsert-instruction";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getInstruction,
  instructionsQueryKeys,
} from "../../../../entities/waste/instructions";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditInstructionPage() {
  const { instructionId } = useParams({
    from: routes.directories.instructions.detail,
  });
  const navigate = useNavigate({
    from: routes.directories.instructions.detail,
  });
  const { activeTenantId } = useTenant();

  const instructionQuery = useQuery({
    queryKey: instructionsQueryKeys.detail(
      activeTenantId ?? "none",
      instructionId,
    ),
    queryFn: ({ signal }) => getInstruction(instructionId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (instructionQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (instructionQuery.isError || !instructionQuery.data) {
    return (
      <AlertDetailPageError
        directoryTo={routes.directories.instructions.list}
        linkLabel="К инструкциям"
        description="Инструкция не найдена."
      />
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description={
        "Чтобы открыть инструкцию, выберите организацию в верхней панели."
      }
    >
      <InstructionForm
        mode="edit"
        instructionId={instructionId}
        initial={instructionQuery.data}
        onSaved={(_instruction, { close }) => {
          toast.success(instructionSavedToast(false));
          if (close) {
            void navigate({ to: routes.directories.instructions.list });
          }
        }}
        onCancel={() =>
          void navigate({ to: routes.directories.instructions.list })
        }
      />
    </TenantRequiredGate>
  );
}
