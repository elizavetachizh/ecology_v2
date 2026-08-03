import { useState, useSyncExternalStore, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import {
  getInstructions,
  subscribeInstructions,
} from "../../../entities/regulatory-document";
import { POD9_STATUS_OPTIONS } from "../../../features/directories/create-structure-node";
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../shared/ui";
import {
  findParentId,
  findStructureNode,
  getStructureTree,
  subscribeStructure,
  updatePod9,
} from "./model/structure.store";
import type { StructureNode } from "./model/structure.mock";
import {
  getPod9Wastes,
  getPod9WastesSnapshot,
  subscribePod9Wastes,
} from "./model/pod9-wastes.store";
import { Pod9WastesSection } from "./ui/Pod9WastesSection";

type Pod9DetailsForm = {
  name: string;
  period: string;
  status: string;
  responsible: string;
};

function createDetailsForm(pod9: StructureNode): Pod9DetailsForm {
  return {
    name: pod9.name,
    period: pod9.period === "—" ? "" : (pod9.period ?? ""),
    status: pod9.status ?? "Черновик",
    responsible: pod9.responsible ?? "",
  };
}

function Pod9DetailsEditor({ pod9 }: { pod9: StructureNode }) {
  const [form, setForm] = useState<Pod9DetailsForm>(() =>
    createDetailsForm(pod9),
  );
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof Pod9DetailsForm>(
    key: K,
    value: Pod9DetailsForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Укажите наименование журнала");
      return;
    }
    if (!form.period.trim()) {
      setError("Укажите период");
      return;
    }
    if (!form.responsible.trim()) {
      setError("Укажите ответственного");
      return;
    }

    updatePod9({ id: pod9.id, ...form });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
        <div>
          <h2 className="font-semibold text-foreground">Данные журнала</h2>
          <p className="text-sm text-muted-foreground">
            Наименование, период и статус журнала.
          </p>
        </div>
      </div>

      {error ? (
        <Alert variant="error" className="sm:col-span-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <label className="grid gap-1.5 text-sm font-medium text-foreground sm:col-span-2">
        Наименование
        <Input
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          autoFocus
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Период
        <Input
          value={form.period}
          onChange={(event) => updateField("period", event.target.value)}
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Статус
        <Select
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
        >
          {POD9_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-foreground sm:col-span-2">
        Ответственный
        <Input
          value={form.responsible}
          onChange={(event) => updateField("responsible", event.target.value)}
        />
      </label>

      <div className="lg:col-span-2">
        <Button type="submit" size="sm">
          Сохранить изменения
        </Button>
      </div>
    </form>
  );
}

export function Pod9Page() {
  const navigate = useNavigate();
  const { pod9Id } = useParams({
    from: "/directories/structure/pod9/$pod9Id",
  });
  const search = useSearch({
    from: "/directories/structure/pod9/$pod9Id",
  });
  const instructions = useSyncExternalStore(
    subscribeInstructions,
    getInstructions,
    getInstructions,
  );

  useSyncExternalStore(subscribeStructure, getStructureTree, getStructureTree);
  useSyncExternalStore(
    subscribePod9Wastes,
    getPod9WastesSnapshot,
    getPod9WastesSnapshot,
  );
  const instructionId = search.instructionId ?? instructions[0]?.id ?? null;

  const [, setTick] = useState(0);
  const pod9 = findStructureNode(getStructureTree(), pod9Id);
  const parentId = findParentId(getStructureTree(), pod9Id);
  const wastes = getPod9Wastes(pod9Id, instructionId);

  if (!pod9 || pod9.type !== "pod9") {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Alert variant="error">
          <AlertDescription>Журнал ПОД-9 не найден.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/structure">К структуре</Link>
        </Button>
      </div>
    );
  }

  const parent =
    typeof parentId === "string"
      ? findStructureNode(getStructureTree(), parentId)
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {pod9.name}
            </h1>
            <span className="inline-flex rounded-md bg-info-muted px-2 py-0.5 text-xs font-medium text-info">
              ПОД-9
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {parent ? (
              <>
                Структурная единица:{" "}
                <Link
                  to="/directories/structure/units/$unitId"
                  params={{ unitId: parent.id }}
                  className="font-medium text-foreground hover:underline"
                >
                  {parent.name}
                  {parent.code ? ` (${parent.code})` : ""}
                </Link>
              </>
            ) : (
              "Карточка журнала ПОД-9"
            )}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/structure">К структуре</Link>
        </Button>
      </div>

      <Tabs
        value={instructionId ?? ""}
        onValueChange={(nextInstructionId) =>
          void navigate({
            to: "/directories/structure/pod9/$pod9Id",
            params: { pod9Id },
            search: { instructionId: nextInstructionId },
            replace: true,
          })
        }
      >
        <TabsList
          aria-label="Инструкции"
          className="max-w-full justify-start overflow-x-auto"
        >
          {instructions.map((instruction) => (
            <TabsTrigger
              key={instruction.id}
              value={instruction.id}
              className="max-w-72 shrink-0"
            >
              <span className="truncate">
                {instruction.number} — {instruction.title}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Pod9DetailsEditor key={pod9.id} pod9={pod9} />

      {instructionId ? (
        <Pod9WastesSection
          pod9Id={pod9Id}
          instructionId={instructionId}
          wastes={wastes}
          onChanged={() => setTick((n) => n + 1)}
        />
      ) : (
        <Alert variant="warning">
          <AlertDescription>
            Создайте инструкцию, чтобы вести список отходов.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
