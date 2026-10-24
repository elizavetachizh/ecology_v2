import {
  DASHBOARD_SUMMARY_OPERATION_TYPES,
  type DashboardSummaryUnit,
} from "../../../../entities/waste/dashboards";
import { OPERATION_TYPE_LABEL } from "../../../../entities/waste/operations";
import { cn } from "../../../../shared/lib/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../shared/ui";

const COLUMN_COUNT = 2 + DASHBOARD_SUMMARY_OPERATION_TYPES.length;

type DashboardSummaryTableProps = {
  rows: DashboardSummaryUnit[];
  loading?: boolean;
};

export function DashboardSummaryTable({
  rows,
  loading = false,
}: DashboardSummaryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead>Подразделение</TableHead>
            <TableHead className="text-right">Всего</TableHead>
            {DASHBOARD_SUMMARY_OPERATION_TYPES.map((type) => (
              <TableHead
                key={type}
                className="min-w-28 text-right whitespace-normal text-xs leading-snug"
              >
                {OPERATION_TYPE_LABEL[type]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMN_COUNT}
                className="h-28 text-center text-muted-foreground"
              >
                Загрузка…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMN_COUNT}
                className="h-28 px-3 text-center"
              >
                <p className="text-sm font-medium text-foreground">
                  Подразделений с журналом ПОД-9 нет
                </p>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.unit.id} className="hover:bg-transparent">
                <TableCell className="font-medium whitespace-nowrap">
                  {row.unit.name}
                </TableCell>
                <CountCell value={row.total} />
                {DASHBOARD_SUMMARY_OPERATION_TYPES.map((type) => (
                  <CountCell key={type} value={row.types[type]} />
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function CountCell({ value }: { value: number }) {
  return (
    <TableCell
      className={cn(
        "text-right tabular-nums",
        value === 0 && "text-muted-foreground",
      )}
    >
      {value.toLocaleString("ru-RU")}
    </TableCell>
  );
}
