import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getPassport,
  passportsQueryKeys,
} from "../../../../entities/waste/passports";
import { PassportForm } from "../../../../features/waste/upsert-passport";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditPassportPage() {
  const { passportId } = useParams({
    from: routes.waste.passports.detail,
  });
  const navigate = useNavigate({
    from: routes.waste.passports.detail,
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
      <AlertDetailPageError
        directoryTo={routes.waste.passports.list}
        linkLabel="К паспортам"
        description="Паспорт не найден."
      />
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
        onCancel={() => void navigate({ to: routes.waste.passports.list })}
      />
    </TenantRequiredGate>
  );
}
