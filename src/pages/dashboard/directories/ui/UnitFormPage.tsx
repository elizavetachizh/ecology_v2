import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import {
  emptyUnitForm,
  saveUnitApi,
  type UnitFormValues,
} from "../../../../features/directories/create-structure-node";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  PageContextBar,
} from "../../../../shared/ui";
import {
  findParentId,
  findStructureNode,
  getStructureTree,
  getUnitPod9Children,
  upsertStructureUnit,
} from "../model/structure.store";

type UnitFormPageProps = {
  mode: "create" | "edit";
  unitId?: string;
  parentId?: string | null;
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

function formatUnitLabel(id: string) {
  const node = findStructureNode(getStructureTree(), id);
  if (!node) return id;
  return `${node.name}${node.code ? ` (${node.code})` : ""}`;
}

export function UnitFormPage({
  mode,
  unitId,
  parentId = null,
}: UnitFormPageProps) {
  const navigate = useNavigate();

  const existing =
    mode === "edit" && unitId
      ? findStructureNode(getStructureTree(), unitId)
      : null;

  const resolvedParentId =
    mode === "edit" && unitId
      ? (findParentId(getStructureTree(), unitId) ?? null)
      : (parentId ?? null);

  const [form, setForm] = useState<UnitFormValues>(() =>
    existing && existing.type === "unit"
      ? {
          name: existing.name,
          code: existing.code === "—" ? "" : (existing.code ?? ""),
        }
      : emptyUnitForm(),
  );
  const [savedId, setSavedId] = useState<string | null>(
    mode === "edit" && existing?.type === "unit" ? existing.id : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [pod9Tick, setPod9Tick] = useState(0);

  const pod9List = useMemo(() => {
    if (!savedId) return [];
    void pod9Tick;
    return getUnitPod9Children(savedId);
  }, [savedId, pod9Tick]);

  const parentLabel =
    resolvedParentId != null ? formatUnitLabel(resolvedParentId) : null;

  const update = <K extends keyof UnitFormValues>(
    key: K,
    value: UnitFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setJustSaved(false);
  };

  const persist = async () => {
    if (!form.name.trim()) {
      setError("Укажите наименование структурной единицы");
      return null;
    }

    setPending(true);
    try {
      const result = await saveUnitApi(form, savedId ?? undefined);
      upsertStructureUnit({
        id: result.id,
        name: result.name,
        code: result.code,
        parentId: resolvedParentId,
      });
      setSavedId(result.id);
      setJustSaved(true);
      setPod9Tick((n) => n + 1);
      setPending(false);
      return result.id;
    } catch {
      setError("Не удалось сохранить структурную единицу");
      setPending(false);
      return null;
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const wasNew = !savedId;
    const id = await persist();
    if (!id) return;

    if (wasNew) {
      await navigate({
        to: "/directories/structure/units/$unitId",
        params: { unitId: id },
        replace: true,
      });
    }
  };

  const handleSaveAndClose = async () => {
    const id = await persist();
    if (!id) return;

    await navigate({
      to: "/directories/structure",
      search: {
        focusId: id,
        expandId: resolvedParentId ?? undefined,
      },
    });
  };

  if (mode === "edit" && (!existing || existing.type !== "unit")) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert variant="error">
          <AlertDescription>Структурная единица не найдена.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/structure">К структуре</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageContextBar
        eyebrow="Структура организации"
        title={
          savedId
            ? form.name || "Структурная единица"
            : "Новая структурная единица"
        }
        description={
          parentLabel ? (
            <>
              Родитель:{" "}
              <span className="font-medium text-foreground">{parentLabel}</span>
            </>
          ) : (
            "Корневой уровень организации"
          )
        }
      />

      {!savedId ? (
        <Alert variant="info">
          <AlertTitle>После сохранения</AlertTitle>
          <AlertDescription>
            Когда единица будет создана, можно будет добавить журнал ПОД-9 на
            этой карточке.
          </AlertDescription>
        </Alert>
      ) : null}

      {justSaved && savedId ? (
        <Alert variant="success">
          <AlertTitle>Сохранено</AlertTitle>
          <AlertDescription>
            Id единицы: <span className="font-mono text-xs">{savedId}</span>.
            Ниже можно создать ПОД-9.
          </AlertDescription>
        </Alert>
      ) : null}

      <form
        onSubmit={handleSave}
        className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2"
      >
        {error ? (
          <Alert variant="error" className="md:col-span-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="unit-name">Наименование</FieldLabel>
          <Input
            id="unit-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Например: Цех №1, Площадка накопления…"
            autoFocus
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="unit-code">Код</FieldLabel>
          <Input
            id="unit-code"
            value={form.code}
            onChange={(e) => update("code", e.target.value)}
            placeholder="Ц-1"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1 md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Сохранение…" : "Сохранить"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => void handleSaveAndClose()}
          >
            Сохранить и закрыть
          </Button>
          <Button asChild type="button" variant="outline" disabled={pending}>
            <Link to="/directories/structure">Отмена</Link>
          </Button>
        </div>
      </form>

      {savedId ? (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <h2 className="font-semibold text-foreground">Журналы ПОД-9</h2>
              <p className="text-sm text-muted-foreground">
                Создаются для этой единицы и отображаются в дереве структуры.
              </p>
            </div>
            <Button asChild size="sm">
              <Link
                to="/directories/structure/pod9/new"
                search={{ parentId: savedId }}
              >
                <Plus className="size-3.5" />
                Создать ПОД-9
              </Link>
            </Button>
          </div>

          {pod9List.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Журналов пока нет. Создайте первый после сохранения единицы.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {pod9List.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <Link
                    to="/directories/structure/pod9/$pod9Id"
                    params={{ pod9Id: item.id }}
                    search={{ instructionId: undefined }}
                    className="min-w-0 hover:underline"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.period ?? "—"} · {item.status ?? "—"}
                      {item.responsible ? ` · ${item.responsible}` : ""}
                    </div>
                  </Link>
                  <span className="rounded-md bg-info-muted px-2 py-0.5 text-xs font-medium text-info">
                    ПОД-9
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
