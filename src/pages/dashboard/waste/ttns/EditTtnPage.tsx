import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import { getTtn, ttnsQueryKeys } from "../../../../entities/waste/ttns";
import { TtnForm } from "../../../../features/waste/upsert-ttn";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";

export function EditTtnPage() {
  const { ttnId } = useParams({ from: "/waste/ttns/$ttnId" });
  const navigate = useNavigate({ from: "/waste/ttns/$ttnId" });
  const { activeTenantId } = useTenant();

  const ttnQuery = useQuery({
    queryKey: ttnsQueryKeys.detail(activeTenantId ?? "none", ttnId),
    queryFn: ({ signal }) => getTtn(ttnId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (ttnQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (ttnQuery.isError || !ttnQuery.data) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>ТТН не найдена.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/waste/ttns">К журналу ТТН</Link>
        </Button>
      </div>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть ТТН, выберите организацию в верхней панели."
    >
      <TtnForm
        mode="edit"
        ttnId={ttnId}
        initial={ttnQuery.data}
        onSaved={() => {
          toast.success("ТТН успешно обновлена");
        }}
        onCancel={() => void navigate({ to: "/waste/ttns" })}
      />
    </TenantRequiredGate>
  );
}
