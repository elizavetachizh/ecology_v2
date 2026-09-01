import { Link } from "@tanstack/react-router";
import {
  formatBalanceAmount,
  isNonZeroAmount,
  unitTitle,
  type DashboardBalance,
} from "../../../../entities/waste/dashboards";
import {
  HAZARD_CLASS_LABEL,
  UOM_LABEL,
} from "../../../../entities/waste/wastes";
import { routes } from "../../../../shared/config/routes";
import { cn } from "../../../../shared/lib/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../shared/ui";

type DashboardBalanceTableProps = {
  groups: DashboardBalance[];
  loading?: boolean;
  selectedUnitId?: string;
  selectedWasteId?: string;
  onSelect: (selection: { unit_id: string; waste_id: string }) => void;
};

function selectOnActivate(
  event: { key: string; preventDefault: () => void },
  select: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    select();
  }
}

export function DashboardBalanceTable({
  groups,
  loading = false,
  selectedUnitId,
  selectedWasteId,
  onSelect,
}: DashboardBalanceTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[16%]">Код</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead className="w-[22%]">Класс опасности</TableHead>
            <TableHead className="w-[18%] text-right">Остаток</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={4}
                className="h-28 text-center text-muted-foreground"
              >
                Загрузка…
              </TableCell>
            </TableRow>
          ) : groups.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="h-28 px-3 text-center">
                <div className="mx-auto max-w-sm space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    На выбранную дату остатков нет
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Проведите первую операцию, чтобы увидеть снимок остатков.
                  </p>
                  <Link
                    to={routes.waste.operations.list}
                    className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Открыть журнал операций
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            groups.flatMap((group) => [
              <TableRow
                key={`unit-${group.unit.id}`}
                className="bg-muted/40 hover:bg-muted/40"
              >
                <TableCell
                  colSpan={4}
                  className="py-2 text-sm font-medium text-foreground"
                >
                  {unitTitle(group.unit)}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {group.wastes.length}
                  </span>
                </TableCell>
              </TableRow>,
              ...group.wastes.map((item) => {
                const selected =
                  group.unit.id === selectedUnitId &&
                  item.waste.id === selectedWasteId;
                const select = () =>
                  onSelect({
                    unit_id: group.unit.id,
                    waste_id: item.waste.id,
                  });
                return (
                  <TableRow
                    key={`${group.unit.id}:${item.waste.id}`}
                    aria-selected={selected}
                    tabIndex={0}
                    className={cn(
                      "cursor-pointer",
                      selected && "bg-accent hover:bg-accent",
                    )}
                    onClick={select}
                    onKeyDown={(event) => selectOnActivate(event, select)}
                  >
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {item.waste.waste_classifier.code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.waste.waste_classifier.name}
                    </TableCell>
                    <TableCell>
                      {HAZARD_CLASS_LABEL[item.waste.hazard_class]}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        !isNonZeroAmount(item.amount) &&
                          "text-muted-foreground",
                      )}
                    >
                      {`${formatBalanceAmount(item.amount)} ${UOM_LABEL[item.waste.uom]}`}
                    </TableCell>
                  </TableRow>
                );
              }),
            ])
          )}
        </TableBody>
      </Table>
    </div>
  );
}
