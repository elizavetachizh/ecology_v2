import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Select,
} from "../../../../shared/ui";
import {
  createPod9Api,
  emptyPod9Form,
  POD9_STATUS_OPTIONS,
  type Pod9FormValues,
} from "../model/forms";

export type CreatePod9FormProps = {
  parentId: string;
  parentLabel: string;
  onCreated: (result: {
    id: string;
    name: string;
    period: string;
    status: string;
    responsible: string;
    parentId: string;
  }) => void;
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

export function CreatePod9Form({
  parentId,
  parentLabel,
  onCreated,
}: CreatePod9FormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Pod9FormValues>(emptyPod9Form);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = <K extends keyof Pod9FormValues>(
    key: K,
    value: Pod9FormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
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

    setPending(true);
    try {
      const result = await createPod9Api(form);
      onCreated({ ...result, parentId });
      await navigate({
        to: "/directories/structure/pod9/$pod9Id",
        params: { pod9Id: result.id },
      });
    } catch {
      setError("Не удалось создать журнал ПОД-9");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Новый журнал ПОД-9
        </h1>
        <p className="text-sm text-muted-foreground">
          Структурная единица:{" "}
          <span className="font-medium text-foreground">{parentLabel}</span>
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4">
        {error ? (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="pod9-name">Наименование</FieldLabel>
          <Input
            id="pod9-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="pod9-period">Период</FieldLabel>
          <Input
            id="pod9-period"
            value={form.period}
            onChange={(e) => update("period", e.target.value)}
            placeholder="Январь–март 2026"
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="pod9-responsible">Ответственный</FieldLabel>
          <Input
            id="pod9-responsible"
            value={form.responsible}
            onChange={(e) => update("responsible", e.target.value)}
            placeholder="ФИО ответственного"
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="pod9-status">Статус</FieldLabel>
          <Select
            id="pod9-status"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {POD9_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохранение…" : "Создать"}
        </Button>
        <Button asChild type="button" variant="outline" disabled={pending}>
          <Link
            to="/directories/structure/units/$unitId"
            params={{ unitId: parentId }}
          >
            Отмена
          </Link>
        </Button>
      </div>
    </form>
  );
}
