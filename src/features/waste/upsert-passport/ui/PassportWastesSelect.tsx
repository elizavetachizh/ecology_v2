import { Link } from "@tanstack/react-router";
import type { ContractWaste } from "../../../../entities/waste/contracts";
import { cn } from "../../../../shared/lib/cn";
import { Button, FieldError } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

type PassportWastesSelectProps = {
  wastes: ContractWaste[];
  value: string[];
  loading: boolean;
  recyclingContractId: string;
  contractLoaded: boolean;
  pending: boolean;
  error?: string;
  conflict: boolean;
  onChange: (ids: string[]) => void;
};

function wasteLabel(item: ContractWaste) {
  return `${item.waste.waste_classifier.code} — ${item.waste.waste_classifier.name}`;
}

export function PassportWastesSelect({
  wastes,
  value,
  loading,
  recyclingContractId,
  contractLoaded,
  pending,
  error,
  conflict,
  onChange,
}: PassportWastesSelectProps) {
  if (!recyclingContractId) {
    return (
      <p className="text-sm text-muted-foreground">
        Выберите договор утилизации — список отходов паспорта ограничен его
        перечнем.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Загрузка перечня…</p>;
  }

  if (!contractLoaded) {
    return (
      <p className="text-sm text-muted-foreground">
        Не удалось загрузить договор. Проверьте выбор и повторите.
      </p>
    );
  }

  if (wastes.length === 0) {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          В выбранном договоре нет отходов. Добавьте перечень в карточке
          договора — без него паспорт сохранить нельзя.
        </p>
        <Button asChild variant="link" className="h-auto p-0 text-sm">
          <Link
            to={routes.directories.contracts.detail}
            params={{ contractId: recyclingContractId }}
          >
            Открыть договор
          </Link>
        </Button>
      </div>
    );
  }

  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Выберите договор утилизации — список отходов паспорта ограничен его
        перечнем. Нужен хотя бы один отход.
      </p>
      {conflict ? (
        <p className="text-sm text-warning-foreground">
          Часть отходов снята: их нет в перечне нового договора.
        </p>
      ) : null}
      <div
        className={cn(
          "space-y-1 rounded-lg border border-border p-2",
          conflict && "border-warning/50",
        )}
      >
        {wastes.map((item) => {
          const checked = value.includes(item.waste_id);
          return (
            <label
              key={item.waste_id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={checked}
                disabled={pending}
                onChange={() => toggle(item.waste_id)}
              />
              <span className="min-w-0 flex-1 truncate">
                {wasteLabel(item)}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}
