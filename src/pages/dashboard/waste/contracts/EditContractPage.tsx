import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  contractsQueryKeys,
  getContract,
} from "../../../../entities/waste/contracts";
import { ContractForm } from "../../../../features/waste/upsert-contract";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditContractPage() {
  const { contractId } = useParams({
    from: routes.directories.contracts.detail,
  });
  const navigate = useNavigate({
    from: routes.directories.contracts.detail,
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
      <AlertDetailPageError
        directoryTo={routes.directories.contracts.list}
        linkLabel="К договорам"
        description="Договор не найден."
      />
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
        onSaved={(_contract, { close }) => {
          toast.success("Договор успешно обновлён");
          if (close) void navigate({ to: routes.directories.contracts.list });
        }}
        onCancel={() =>
          void navigate({ to: routes.directories.contracts.list })
        }
      />
    </TenantRequiredGate>
  );
}
