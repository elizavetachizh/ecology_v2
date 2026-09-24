import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Unit } from "../../../../../../entities/waste/units";
import {
  Badge,
  Button,
  DataTable,
  type ColumnDef,
} from "../../../../../../shared/ui";
import { routes } from "../../../../../../shared/config/routes";

type UnitDirectChildrenProps = {
  parentId: string;
  units: Unit[];
};

function unitNameColumn(): ColumnDef<Unit> {
  return {
    id: "name",
    header: "Название",
    cell: ({ row }) => (
      <Link
        to={routes.directories.units.detail}
        params={{ unitId: row.original.id }}
        search={{ instructionId: undefined }}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  };
}

function shortNameColumn(): ColumnDef<Unit> {
  return {
    id: "short_name",
    header: "Краткое",
    cell: ({ row }) => row.original.short_name || "—",
  };
}

const journalColumns: ColumnDef<Unit>[] = [
  unitNameColumn(),
  shortNameColumn(),
  {
    id: "is_pod9",
    header: "ПОД-9",
    enableSorting: false,
    cell: () => <Badge variant="info">ПОД-9</Badge>,
  },
];

const structuralColumns: ColumnDef<Unit>[] = [
  unitNameColumn(),
  shortNameColumn(),
  {
    id: "region",
    header: "Регион",
    cell: ({ row }) => row.original.region?.name ?? "—",
  },
  {
    id: "district",
    header: "Район",
    cell: ({ row }) => row.original.district?.name ?? "—",
  },
];

function splitChildren(units: Unit[]) {
  const structural: Unit[] = [];
  const journals: Unit[] = [];
  for (const unit of units) {
    if (unit.is_pod9) journals.push(unit);
    else structural.push(unit);
  }
  return { structural, journals };
}

export function UnitDirectChildren({
  parentId,
  units,
}: UnitDirectChildrenProps) {
  const { structural, journals } = splitChildren(units);

  return (
    <>
      <section className="mx-auto max-w-4xl space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground">
              Дочерние единицы ({structural.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Показаны только прямые потомки. Чтобы увидеть уровень ниже,
              откройте единицу.
            </p>
          </div>
          <Button asChild size="sm">
            <Link
              to={routes.directories.units.new}
              search={{ parentId, isPod9: false }}
            >
              <Plus className="size-3.5" />
              Дочерняя единица
            </Link>
          </Button>
        </div>
        <DataTable
          columns={structuralColumns}
          data={structural}
          getRowId={(row) => row.id}
          emptyTitle="Нет дочерних единиц"
        />
      </section>

      <section className="mx-auto max-w-4xl space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground">
              Журналы ПОД-9 ({journals.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Создайте журнал учёта отходов ПОД-9 в контексте этой структурной
              единицы.
            </p>
          </div>
          <Button asChild size="sm">
            <Link
              to={routes.directories.units.new}
              search={{ parentId, isPod9: true }}
            >
              <Plus className="size-3.5" />
              Создать журнал ПОД-9
            </Link>
          </Button>
        </div>
        <DataTable
          columns={journalColumns}
          data={journals}
          getRowId={(row) => row.id}
          emptyTitle="Журналов ПОД-9 нет"
          emptyDescription="Журнал учёта отходов на этой единице ещё не создан."
        />
      </section>
    </>
  );
}
