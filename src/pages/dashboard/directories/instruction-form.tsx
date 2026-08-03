import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  PageContextBar,
} from "../../../shared/ui";
import {
  createInstruction,
  emptyInstructionForm,
  findInstruction,
  updateInstruction,
  type InstructionFormValues,
} from "../../../entities/regulatory-document";

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

type InstructionFormPageProps = {
  mode: "create" | "edit";
  instructionId?: string;
};

export function InstructionFormPage({
  mode,
  instructionId,
}: InstructionFormPageProps) {
  const navigate = useNavigate();
  const existing =
    mode === "edit" && instructionId ? findInstruction(instructionId) : null;

  const [form, setForm] = useState<InstructionFormValues>(() =>
    existing
      ? {
          title: existing.title,
          number: existing.number === "—" ? "" : existing.number,
          approvedAt: existing.approvedAt === "—" ? "" : existing.approvedAt,
          responsible: existing.responsible === "—" ? "" : existing.responsible,
        }
      : emptyInstructionForm(),
  );
  const [savedId, setSavedId] = useState<string | null>(
    mode === "edit" && existing ? existing.id : null,
  );
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = <K extends keyof InstructionFormValues>(
    key: K,
    value: InstructionFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setJustSaved(false);
  };

  const persist = () => {
    if (!form.title.trim()) {
      setError("Укажите наименование инструкции");
      return null;
    }

    setPending(true);
    try {
      if (savedId) {
        const updated = updateInstruction(savedId, form);
        setPending(false);
        if (!updated) {
          setError("Инструкция не найдена");
          return null;
        }
        setJustSaved(true);
        return updated.id;
      }

      const created = createInstruction(form);
      setSavedId(created.id);
      setJustSaved(true);
      setPending(false);
      return created.id;
    } catch {
      setError("Не удалось сохранить инструкцию");
      setPending(false);
      return null;
    }
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    const wasNew = !savedId;
    const id = persist();
    if (!id) return;

    if (wasNew) {
      void navigate({
        to: "/directories/instructions/$instructionId",
        params: { instructionId: id },
        replace: true,
      });
    }
  };

  const handleSaveAndClose = () => {
    const id = persist();
    if (!id) return;
    void navigate({ to: "/directories/instructions" });
  };

  if (mode === "edit" && !existing && !savedId) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert variant="error">
          <AlertDescription>Инструкция не найдена.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/instructions">К инструкциям</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageContextBar
        eyebrow="Справочники / Инструкции"
        title={savedId ? form.title || "Инструкция" : "Новая инструкция"}
        description="Документ эколога — отправная точка заполнения справочников."
      />

      {!savedId ? (
        <Alert variant="info">
          <AlertTitle>С чего начать</AlertTitle>
          <AlertDescription>
            Создайте инструкцию по обращению с отходами. После сохранения можно
            перейти к структурным единицам организации.
          </AlertDescription>
        </Alert>
      ) : null}

      {justSaved || savedId ? (
        <Alert variant="success">
          <AlertTitle>
            {justSaved ? "Инструкция сохранена" : "Следующий шаг"}
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Теперь заполните структуру организации — создайте структурные
              единицы, к которым будут привязаны журналы ПОД-9.
            </p>
            <Button asChild size="sm">
              <Link
                to="/directories/structure/units/new"
                search={{ parentId: "" }}
              >
                Перейти к созданию структурных единиц
              </Link>
            </Button>
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
          <FieldLabel htmlFor="instr-title">Наименование</FieldLabel>
          <Input
            id="instr-title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Инструкция по обращению с отходами…"
            autoFocus
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="instr-number">Номер</FieldLabel>
          <Input
            id="instr-number"
            value={form.number}
            onChange={(e) => update("number", e.target.value)}
            placeholder="И-01/2026"
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="instr-date">Дата утверждения</FieldLabel>
          <Input
            id="instr-date"
            value={form.approvedAt}
            onChange={(e) => update("approvedAt", e.target.value)}
            placeholder="01.01.2026"
            type="date"
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="instr-responsible">Ответственный</FieldLabel>
          <Input
            id="instr-responsible"
            value={form.responsible}
            onChange={(e) => update("responsible", e.target.value)}
            placeholder="ФИО эколога"
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
            onClick={handleSaveAndClose}
          >
            Сохранить и закрыть
          </Button>
          <Button asChild type="button" variant="outline" disabled={pending}>
            <Link to="/directories/instructions">Отмена</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

export function CreateInstructionPage() {
  return <InstructionFormPage mode="create" />;
}

export function EditInstructionPage() {
  const { instructionId } = useParams({
    from: "/directories/instructions/$instructionId",
  });
  return <InstructionFormPage mode="edit" instructionId={instructionId} />;
}
