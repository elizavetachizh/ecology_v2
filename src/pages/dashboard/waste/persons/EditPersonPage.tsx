import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getPerson,
  personsQueryKeys,
} from "../../../../entities/waste/persons";
import { PersonForm } from "../../../../features/waste/upsert-person";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditPersonPage() {
  const { personId } = useParams({
    from: routes.directories.persons.detail,
  });
  const navigate = useNavigate({
    from: routes.directories.persons.detail,
  });
  const { activeTenantId } = useTenant();

  const personQuery = useQuery({
    queryKey: personsQueryKeys.detail(activeTenantId ?? "none", personId),
    queryFn: ({ signal }) => getPerson(personId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (personQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (personQuery.isError || !personQuery.data) {
    return (
      <AlertDetailPageError
        directoryTo={routes.directories.persons.list}
        linkLabel="К ответственным"
        description="Ответственный не найден."
      />
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть ответственного, выберите организацию в верхней панели."
    >
      <PersonForm
        mode="edit"
        personId={personId}
        initial={personQuery.data}
        onSaved={(_person, { close }) => {
          toast.success("Ответственный успешно обновлён");
          if (close) void navigate({ to: routes.directories.persons.list });
        }}
        onCancel={() => void navigate({ to: routes.directories.persons.list })}
      />
    </TenantRequiredGate>
  );
}
