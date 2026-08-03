import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Unlink } from "lucide-react";
import { findInstruction } from "../../../../entities/regulatory-document";
import {
  Alert,
  AlertDescription,
  AlertTitle,
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
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  type ColumnDef,
} from "../../../../shared/ui";
import {
  addPod9Waste,
  bindExistingWasteToPod9,
  emptyPod9WasteForm,
  getPod9Wastes,
  getWastesByInstruction,
  HAZARD_CLASS_OPTIONS,
  removeWasteBinding,
  WASTE_UNIT_OPTIONS,
  type Pod9Waste,
  type Pod9WasteFormValues,
} from "../model/pod9-wastes.store";

type Pod9WastesSectionProps = {
  pod9Id: string;
  instructionId: string;
  wastes: Pod9Waste[];
  onChanged: () => void;
};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

export function Pod9WastesSection({
  pod9Id,
  instructionId,
  wastes,
  onChanged,
}: Pod9WastesSectionProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"bind" | "create">("bind");
  const [selectedWasteId, setSelectedWasteId] = useState("");
  const [form, setForm] = useState<Pod9WasteFormValues>(emptyPod9WasteForm);
  const [error, setError] = useState<string | null>(null);
  const [detachingWaste, setDetachingWaste] = useState<Pod9Waste | null>(null);
  const instruction = findInstruction(instructionId);

  const catalog = getWastesByInstruction(instructionId);
  const alreadyBound = new Set(
    getPod9Wastes(pod9Id, instructionId).map((item) => item.id),
  );
  const available = catalog.filter((item) => !alreadyBound.has(item.id));

  const columns = useMemo<ColumnDef<Pod9Waste>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Наименование",
        cell: ({ row }) => (
          <Link
            to="/directories/wastes/$wasteId"
            params={{ wasteId: row.original.id }}
            search={{ instructionId }}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "hazardClass",
        header: "Класс опасности",
        cell: ({ row }) => row.original.hazardClass,
      },
      {
        accessorKey: "unit",
        header: "Ед. измерения",
        cell: ({ row }) => row.original.unit,
      },
      {
        accessorKey: "source",
        header: "Источник образования",
        cell: ({ row }) => row.original.source,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions>
            <DataTableRowAction asChild label="Открыть карточку отхода">
              <Link
                to="/directories/wastes/$wasteId"
                params={{ wasteId: row.original.id }}
                search={{ instructionId }}
              >
                Открыть
              </Link>
            </DataTableRowAction>
            <DataTableRowAction
              label="Отвязать отход от ПОД-9"
              onClick={() => setDetachingWaste(row.original)}
            >
              <Unlink />
              Отвязать
            </DataTableRowAction>
          </DataTableRowActions>
        ),
      },
    ],
    [instructionId],
  );

  const reset = () => {
    setMode(available.length > 0 ? "bind" : "create");
    setSelectedWasteId("");
    setForm(emptyPod9WasteForm());
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    else {
      setMode(available.length > 0 ? "bind" : "create");
      setError(null);
    }
    setOpen(next);
  };

  const update = <K extends keyof Pod9WasteFormValues>(
    key: K,
    value: Pod9WasteFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (mode === "bind") {
      if (!selectedWasteId) {
        setError("Выберите отход из справочника");
        return;
      }
      const binding = bindExistingWasteToPod9(selectedWasteId, pod9Id);
      if (!binding) {
        setError("Не удалось привязать отход");
        return;
      }
      onChanged();
      handleOpenChange(false);
      return;
    }

    if (!form.name.trim()) {
      setError("Укажите наименование отхода");
      return;
    }
    if (!form.source.trim()) {
      setError("Укажите источник образования");
      return;
    }

    const created = addPod9Waste(pod9Id, instructionId, form);
    if (!created) {
      setError("Не удалось создать и привязать отход");
      return;
    }
    onChanged();
    handleOpenChange(false);
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Отходы</h2>
          <p className="text-sm text-muted-foreground">
            К журналу привязываются отходы из справочника. Один отход может
            учитываться в нескольких ПОД-9.
          </p>
          <span className="inline-flex max-w-full rounded-md bg-info-muted px-2 py-1 text-xs font-medium text-info">
            Инструкция: {instruction?.number ?? "—"} —{" "}
            {instruction?.title ?? "Не найдена"}
          </span>
        </div>
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" />
          Добавить отход
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={wastes}
        getRowId={(row) => row.bindingId}
        emptyTitle="Отходов пока нет"
        emptyDescription="Привяжите отход из справочника или создайте новый."
      />

      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className="max-w-xl">
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <ModalTitle>Добавление отхода в журнал ПОД-9</ModalTitle>
              <ModalDescription>
                Выберите существующий вид отхода либо создайте новый вид в
                справочнике.
              </ModalDescription>
              <span className="text-xs text-muted-foreground">
                Отходы фильтруются по инструкции:{" "}
                <strong className="font-medium text-foreground">
                  {instruction?.number ?? "—"} —{" "}
                  {instruction?.title ?? "Не найдена"}
                </strong>
              </span>
            </ModalHeader>

            <div className="grid gap-4 py-2">
              {error ? (
                <Alert variant="error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Tabs
                value={mode}
                onValueChange={(value) => {
                  setMode(value as "bind" | "create");
                  setError(null);
                }}
              >
                <TabsList className="grid h-auto w-full grid-cols-2">
                  <TabsTrigger value="bind" disabled={available.length === 0}>
                    Выбрать существующий
                  </TabsTrigger>
                  <TabsTrigger value="create">Создать новый вид</TabsTrigger>
                </TabsList>
              </Tabs>

              <Alert variant="info">
                <AlertTitle>
                  {mode === "bind"
                    ? "Выберите существующий отход из справочника"
                    : "Создайте новый вид отхода"}
                </AlertTitle>
                <AlertDescription>
                  {mode === "bind"
                    ? "К этому ПОД-9 будет привязан существующий вид отхода из справочника выбранной инструкции."
                    : "Новый вид появится в общем справочнике отходов выбранной инструкции и сразу будет привязан к этому ПОД-9."}
                </AlertDescription>
              </Alert>

              {mode === "bind" ? (
                available.length === 0 ? (
                  <Alert variant="info">
                    <AlertTitle>
                      Справочник пуст или всё уже привязано
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>
                        Создайте отход в справочнике либо воспользуйтесь
                        «Создать и привязать».
                      </p>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          to="/directories/wastes/new"
                          search={{ instructionId }}
                        >
                          Открыть справочник отходов
                        </Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-1.5">
                    <FieldLabel htmlFor="pick-waste">Отход</FieldLabel>
                    <Select
                      id="pick-waste"
                      value={selectedWasteId}
                      onChange={(e) => {
                        setSelectedWasteId(e.target.value);
                        setError(null);
                      }}
                    >
                      <option value="">Выберите отход…</option>
                      {available.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (кл. {item.hazardClass})
                        </option>
                      ))}
                    </Select>
                  </div>
                )
              ) : (
                <>
                  <div className="grid gap-1.5">
                    <FieldLabel htmlFor="waste-name">Наименование</FieldLabel>
                    <Input
                      id="waste-name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <FieldLabel htmlFor="waste-hazard">
                      Класс опасности
                    </FieldLabel>
                    <Select
                      id="waste-hazard"
                      value={form.hazardClass}
                      onChange={(e) => update("hazardClass", e.target.value)}
                    >
                      {HAZARD_CLASS_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <FieldLabel htmlFor="waste-unit">
                      Единица измерения
                    </FieldLabel>
                    <Select
                      id="waste-unit"
                      value={form.unit}
                      onChange={(e) => update("unit", e.target.value)}
                    >
                      {WASTE_UNIT_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <FieldLabel htmlFor="waste-source">
                      Источник образования
                    </FieldLabel>
                    <Input
                      id="waste-source"
                      value={form.source}
                      onChange={(e) => update("source", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={mode === "bind" && available.length === 0}
              >
                {mode === "bind" ? "Привязать" : "Создать и привязать"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={detachingWaste !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetachingWaste(null);
        }}
        title="Убрать отход из ПОД-9?"
        confirmLabel="Отвязать"
        description={
          <>
            Отход «{detachingWaste?.name}» будет удалён только из этого журнала
            ПОД-9. Карточка вида отхода сохранится в справочнике.
          </>
        }
        onConfirm={() => {
          if (!detachingWaste) return;
          removeWasteBinding(detachingWaste.bindingId);
          onChanged();
        }}
      />
    </section>
  );
}
