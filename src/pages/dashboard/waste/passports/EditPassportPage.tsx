import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getPassport,
  passportsQueryKeys,
} from "../../../../entities/waste/passports";
import { PassportForm } from "../../../../features/waste/upsert-passport";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";

export function EditPassportPage() {
  const { passportId } = useParams({
    from: "/waste/passports/$passportId",
  });
  const navigate = useNavigate({
    from: "/waste/passports/$passportId",
  });
  const { activeTenantId } = useTenant();

  const passportQuery = useQuery({
    queryKey: passportsQueryKeys.detail(activeTenantId ?? "none", passportId),
    queryFn: ({ signal }) => getPassport(passportId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (passportQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (passportQuery.isError || !passportQuery.data) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>Паспорт не найден.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/waste/passports">К паспортам</Link>
        </Button>
      </div>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть паспорт, выберите организацию в верхней панели."
    >
      <PassportForm
        mode="edit"
        passportId={passportId}
        initial={passportQuery.data}
        onSaved={() => {
          toast.success("Паспорт успешно обновлён");
        }}
        onCancel={() => void navigate({ to: "/waste/passports" })}
      />
    </TenantRequiredGate>
  );
}
