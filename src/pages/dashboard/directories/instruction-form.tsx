import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { InstructionForm } from "../../../features/waste/upsert-instruction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../../../app/providers/tenant/tenant-context";
import {
  getInstruction,
  instructionsQueryKeys,
} from "../../../entities/waste/instructions";
import { Alert, AlertDescription, AlertTitle, Button } from "../../../shared/ui";

export function CreateInstructionPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  if (!activeTenantId) {
    return (
      <Alert variant="info">
        <AlertTitle>Выберите организацию</AlertTitle>
        <AlertDescription>
          Создание инструкции доступно после выбора организации в верхней
          панели.
        </AlertDescription>
      </Alert>
    );
  }

  return (
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
  );
}

export function EditInstructionPage() {
  const { instructionId } = useParams({
    from: "/directories/instructions/$instructionId",
  });
  const navigate = useNavigate(); 
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenant();

  const instructionQuery = useQuery({
    queryKey: instructionsQueryKeys.detail(
      activeTenantId ?? "none",
      instructionId,
    ),
    queryFn: ({ signal }) => getInstruction(instructionId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (!activeTenantId) {
    return (
      <Alert variant="info">
        <AlertTitle>Выберите организацию</AlertTitle>
        <AlertDescription>
          Чтобы открыть инструкцию, выберите организацию в верхней панели.
        </AlertDescription>
      </Alert>
    );
  }

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
    <InstructionForm
      mode="edit" 
      instructionId={instructionId}
      initial={instructionQuery.data}
      showNextStepCta
      onSaved={(_i, { close }) => {
        if (close) void navigate({ to: "/directories/instructions" });
        else
          void queryClient.invalidateQueries({
            queryKey: instructionsQueryKeys.detail(
              activeTenantId,
              instructionId,
            ),
          });
      }}
      onCancel={() => void navigate({ to: "/directories/instructions" })}
    />
  );
}
