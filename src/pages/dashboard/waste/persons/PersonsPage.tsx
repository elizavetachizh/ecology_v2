import { routes } from "../../../../shared/config/routes";
import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_PERSONS_LIST_LIMIT,
  deletePerson,
  personsQueryKeys,
  usePersonsListQuery,
  type Person,
  type PersonSortField,
  type PersonSortOrder,
} from "../../../../entities/waste/persons";
import { PersonFormModal } from "../../../../features/waste/upsert-person";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  DataTablePagination,
  ListSearchField,
  PageContextBar,
  DirectoryBreadcrumb,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { personsColumns } from "./persons-columns";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";

export function PersonsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.directories.persons.list });
  const search = useSearch({ from: routes.directories.persons.list });
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState<Person | null>(null);

  const columns = useMemo(
    () => personsColumns(setDeleting, setModalMode, setEditing),
    [],
  );

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
      limit: search.limit ?? DEFAULT_PERSONS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const {
    items: persons,
    total,
    limit,
    offset,
    loading,
    error,
  } = usePersonsListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "name", search.order ?? "asc"),
    [search.sort, search.order],
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePerson(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: personsQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("Ответственный успешно удалён");
    },
    onError: (err) => toast.error(err.message),
  });

  const patchSearch = (patch: {
    q?: string | undefined;
    sort?: PersonSortField | undefined;
    order?: PersonSortOrder | undefined;
    offset?: number;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if ("q" in patch || "sort" in patch || "order" in patch) {
          next.offset = patch.offset ?? 0;
        }
        return next;
      },
    });
  };

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить ответственных</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={activeTenantId} resourceLabel="ответственных">
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          eyebrow={
            <DirectoryBreadcrumb
              directoryLabel="Ответственные"
              directoryTo={routes.directories.persons.list}
            />
          }
          title="Ответственные"
          description="Справочник ответственных за экологический мониторинг."
          actions={
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditing(null);
                setModalMode("create");
              }}
            >
              <Plus className="size-3.5" />
              Добавить ответственного
            </Button>
          }
        />

        <ListSearchField
          value={search.q ?? ""}
          placeholder="Поиск по ФИО"
          onSearch={(q) => patchSearch({ q: q || undefined })}
        />

        <DataTable
          columns={columns}
          data={persons}
          isLoading={loading}
          getRowId={(row) => row.id}
          manualSorting
          sorting={sorting}
          onSortingChange={(next) => {
            const { sort, order } = sortingToSearch(next);
            patchSearch({
              sort: (sort as PersonSortField | undefined) ?? undefined,
              order,
            });
          }}
          emptyTitle="Ответственных пока нет"
          emptyDescription="Добавьте первого ответственного в справочник."
        />
        <DataTablePagination
          total={total}
          limit={limit}
          offset={offset}
          disabled={loading}
          onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
        />

        <PersonFormModal
          open={modalMode !== null}
          mode={modalMode === "edit" ? "edit" : "create"}
          personId={editing?.id}
          initial={editing}
          onOpenChange={(open) => {
            if (!open) {
              setModalMode(null);
              setEditing(null);
            }
          }}
          onSaved={() => {
            toast.success(
              modalMode === "edit"
                ? "Ответственный успешно обновлён"
                : "Ответственный успешно создан",
            );
            setModalMode(null);
            setEditing(null);
          }}
        />

        <ConfirmDialog
          open={deleting !== null}
          confirmDisabled={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title="Удалить ответственного?"
          confirmLabel="Удалить"
          description={
            <>Ответственный «{deleting?.name}» будет удалён из справочника.</>
          }
          onConfirm={() => {
            if (deleting) void deleteMutation.mutateAsync(deleting.id);
          }}
        />
      </div>
    </TenantRequiredGate>
  );
}
