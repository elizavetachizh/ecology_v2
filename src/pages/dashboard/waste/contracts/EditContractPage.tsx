import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  contractsQueryKeys,
  getContract,
} from "../../../../entities/waste/contracts";
import { ContractForm } from "../../../../features/waste/upsert-contract";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";

export function EditContractPage() {
  const { contractId } = useParams({
    from: "/directories/contracts/$contractId",
  });
  const navigate = useNavigate({
    from: "/directories/contracts/$contractId",
  });
  const { activeTenantId } = useTenant();

  const contractQuery = useQuery({
    queryKey: contractsQueryKeys.detail(activeTenantId ?? "none", contractId),
    queryFn: ({ signal }) => getContract(contractId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (contractQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (contractQuery.isError || !contractQuery.data) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>Договор не найден.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/contracts">К договорам</Link>
        </Button>
      </div>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть договор, выберите организацию в верхней панели."
    >
      <ContractForm
        tenantId={activeTenantId}
        mode="edit"
        contractId={contractId}
        initial={contractQuery.data}
        onSaved={() => {
          toast.success("Договор успешно обновлён");
        }}
        onCancel={() => void navigate({ to: "/directories/contracts" })}
      />
    </TenantRequiredGate>
  );
}
