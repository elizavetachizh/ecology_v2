import { Link } from "@tanstack/react-router";
import {
  formatBalanceAmount,
  isNonZeroAmount,
  type DashboardFormed,
} from "../../../../entities/waste/dashboards";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
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
import { selectOnActivate } from "../lib/select-on-activate";

type DashboardFormedTableProps = {
  rows: DashboardFormed[];
  loading?: boolean;
  selectedWasteId?: string;
  onSelect: (selection: { waste_id: string }) => void;
};

export function DashboardFormedTable({
  rows,
  loading = false,
  selectedWasteId,
  onSelect,
}: DashboardFormedTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[16%]">Код</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead className="w-[28%] text-right">Сумма</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={3}
                className="h-28 text-center text-muted-foreground"
              >
                Загрузка…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="h-28 px-3 text-center">
                <div className="mx-auto max-w-sm space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    За выбранный год образованных отходов нет
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Показываются отходы, по которым за год было образование.
                  </p>
                  <Link
                    to={routes.operations.list}
                    className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Открыть журнал операций
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item) => {
              const selected = item.waste.id === selectedWasteId;
              const select = () => onSelect({ waste_id: item.waste.id });
              const uom = UOM_LABEL[item.waste.uom];
              return (
                <TableRow
                  key={item.waste.id}
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
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      !isNonZeroAmount(item.amount) && "text-muted-foreground",
                    )}
                  >
                    {`${formatBalanceAmount(item.amount)} ${uom}`}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
