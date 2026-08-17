import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { InstructionForm } from "../../../../features/waste/upsert-instruction";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getInstruction,
  instructionsQueryKeys,
} from "../../../../entities/waste/instructions";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";

export function EditInstructionPage() {
  const { instructionId } = useParams({
    from: "/directories/instructions/$instructionId",
  });
  const navigate = useNavigate({
    from: "/directories/instructions/$instructionId",
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
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>Инструкция не найдена.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/instructions">К инструкциям</Link>
        </Button>
      </div>
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
        showNextStepCta
        onSaved={(_i, { close }) => {
          toast.success("Инструкция успешно обновлена");
          if (close) void navigate({ to: "/directories/instructions" });
        }}
        onCancel={() => void navigate({ to: "/directories/instructions" })}
      />
    </TenantRequiredGate>
  );
}
