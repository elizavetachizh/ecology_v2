import { useState, useSyncExternalStore, type ReactNode } from "react";
import {
  createFormationSource,
  getFormationSources,
  getFormationSourcesSnapshot,
  subscribeFormationSources,
} from "../../../../entities/waste/formation-source";
import { Button, Input, Select } from "../../../../shared/ui";

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

type FormationSourceSelectProps = {
  id?: string;
  value: string;
  onChange: (sourceId: string) => void;
  disabled?: boolean;
};

export function FormationSourceSelect({
  id = "formation-source",
  value,
  onChange,
  disabled = false,
}: FormationSourceSelectProps) {
  useSyncExternalStore(
    subscribeFormationSources,
    getFormationSourcesSnapshot,
    getFormationSourcesSnapshot,
  );
  const sources = getFormationSources();

  const [createMode, setCreateMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const handleSelectChange = (next: string) => {
    if (next === "__create__") {
      setCreateMode(true);
      setCreateError(null);
      return;
    }
    setCreateMode(false);
    setNewName("");
    setCreateError(null);
    onChange(next);
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      setCreateError("Укажите наименование источника");
      return;
    }
    const created = createFormationSource({ name: newName });
    onChange(created.id);
    setCreateMode(false);
    setNewName("");
    setCreateError(null);
  };

  return (
    <div className="grid gap-2">
      <div className="grid gap-1.5">
        <FieldLabel htmlFor={id}>Источник образования</FieldLabel>
        <Select
          id={id}
          value={createMode ? "__create__" : value}
          disabled={disabled}
          onChange={(event) => handleSelectChange(event.target.value)}
        >
          <option value="">Выберите источник…</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
          <option value="__create__">+ Создать новый источник…</option>
        </Select>
      </div>

      {createMode ? (
        <div className="grid gap-2 rounded-md border border-border bg-muted/20 p-3">
          <div className="grid gap-1.5">
            <FieldLabel htmlFor={`${id}-new-name`}>
              Наименование источника
            </FieldLabel>
            <Input
              id={`${id}-new-name`}
              value={newName}
              autoFocus
              placeholder="Например: Цех №3"
              onChange={(event) => {
                setNewName(event.target.value);
                setCreateError(null);
              }}
            />
          </div>
          {createError ? (
            <p className="text-sm text-destructive">{createError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleCreate}>
              Создать источник
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setCreateMode(false);
                setNewName("");
                setCreateError(null);
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
