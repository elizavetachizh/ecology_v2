import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import {
  createFormationSource,
  deleteFormationSource,
  getFormationSources,
  getFormationSourcesSnapshot,
  subscribeFormationSources,
  type FormationSource,
} from "../../../entities/waste/formation-source";
import {
  Alert,
  AlertDescription,
  Button,
  ConfirmDialog,
  DataTable,
  DataTableRowAction,
  DataTableRowActions,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  PageContextBar,
  type ColumnDef,
} from "../../../shared/ui";

export function FormationSourcesPage() {
  useSyncExternalStore(
    subscribeFormationSources,
    getFormationSourcesSnapshot,
    getFormationSourcesSnapshot,
  );
  const sources = getFormationSources();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<FormationSource | null>(null);

  const columns = useMemo<ColumnDef<FormationSource>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Наименование",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions>
            <DataTableRowAction
              label="Удалить источник"
              onClick={() => setDeleting(row.original)}
            >
              <Trash2 />
              Удалить
            </DataTableRowAction>
          </DataTableRowActions>
        ),
      },
    ],
    [],
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setName("");
      setError(null);
    }
  };

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Укажите наименование источника");
      return;
    }
    createFormationSource({ name });
    handleOpenChange(false);
  };

  return (
    <div className="space-y-6">
      <PageContextBar
        eyebrow="Справочники"
        title="Источники образования"
        description="Все источники образования отходов предприятия. Источник указывается при привязке отхода к журналу ПОД-9."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/directories">К справочникам</Link>
            </Button>
            <Button type="button" size="sm" onClick={() => setOpen(true)}>
              <Plus className="size-3.5" />
              Добавить источник
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={sources}
        getRowId={(row) => row.id}
        emptyTitle="Источников пока нет"
        emptyDescription="Создайте первый источник образования отходов."
      />

      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className="max-w-md">
          <form onSubmit={handleCreate}>
            <ModalHeader>
              <ModalTitle>Новый источник образования</ModalTitle>
              <ModalDescription>
                Источник появится в справочнике и станет доступен при привязке
                отходов к журналам ПОД-9.
              </ModalDescription>
            </ModalHeader>
            <div className="grid gap-3 py-2">
              {error ? (
                <Alert variant="error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError(null);
                }}
                placeholder="Например: Цех №3"
                autoFocus
              />
            </div>
            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit">Создать</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleting(null);
        }}
        title="Удалить источник?"
        confirmLabel="Удалить"
        description={
          <>
            Источник «{deleting?.name}» будет удалён из справочника. Существующие
            привязки к журналам ПОД-9 не изменятся автоматически.
          </>
        }
        onConfirm={() => {
          if (!deleting) return;
          deleteFormationSource(deleting.id);
        }}
      />
    </div>
  );
}
