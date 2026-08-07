import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { InstructionForm } from "../../../features/waste/upsert-instruction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInstruction,
  instructionsQueryKeys,
} from "../../../entities/waste/instructions";
import { Alert, AlertDescription, Button } from "../../../shared/ui";

export function CreateInstructionPage() {
  const navigate = useNavigate();
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

  const instructionQuery = useQuery({
    queryKey: instructionsQueryKeys.detail(instructionId),
    queryFn: ({ signal }) => getInstruction(instructionId, signal),
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
    <InstructionForm
      mode="edit"
      instructionId={instructionId}
      initial={instructionQuery.data}
      showNextStepCta
      onSaved={(_i, { close }) => {
        if (close) void navigate({ to: "/directories/instructions" });
        else
          void queryClient.invalidateQueries({
            queryKey: instructionsQueryKeys.detail(instructionId),
          });
      }}
      onCancel={() => void navigate({ to: "/directories/instructions" })}
    />
  );
}
