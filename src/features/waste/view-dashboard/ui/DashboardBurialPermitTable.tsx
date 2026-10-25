import { Link } from "@tanstack/react-router";
import {
  formatBalanceAmount,
  isAmountOverLimit,
  isNonZeroAmount,
  type DashboardBurialPermit,
} from "../../../../entities/waste/dashboards";
import { unitLabel } from "../../../../entities/waste/units";
import { PermitStatusBadge } from "../../../../entities/waste/permits";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import { routes } from "../../../../shared/config/routes";
import { cn } from "../../../../shared/lib/cn";
import { fillPercent } from "../../../../shared/lib/fill-percent";
import { formatDate } from "../../../../shared/lib/format-date";
import {
  FillMeter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../shared/ui";
import { selectOnActivate } from "../lib/select-on-activate";
import { useCallback } from "react";

type DashboardBurialPermitTableProps = {
  groups: DashboardBurialPermit[];
  loading?: boolean;
  selectedPermitId?: string;
  selectedWasteId?: string;
  onSelect: (selection: { permit_id: string; waste_id: string }) => void;
};

function permitPeriod(startDate: string, endDate: string | null): string {
  const start = formatDate(startDate);
  return endDate ? `${start} — ${formatDate(endDate)}` : `${start} — бессрочно`;
}

export function DashboardBurialPermitTable({
  groups,
  loading = false,
  selectedPermitId,
  selectedWasteId,
  onSelect,
}: DashboardBurialPermitTableProps) {
  const getPercent = useCallback((amount: string, limit: string) => {
    return fillPercent(amount, limit);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[16%]">Код</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead>Факт/Лимит</TableHead>
            <TableHead className="text-right">%</TableHead>
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
          ) : groups.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="h-28 px-3 text-center">
                <div className="mx-auto max-w-sm space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    За выбранный год разрешений нет
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Показываются разрешения, срок которых пересекает календарный
                    год.
                  </p>
                  <Link
                    to={routes.directories.permits.list}
                    className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Открыть разрешения
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            groups.flatMap((group) => [
              <TableRow
                key={`permit-${group.permit.id}`}
                className="bg-muted/40 hover:bg-muted/40"
              >
                <TableCell
                  colSpan={4}
                  className="py-2 text-sm font-medium text-foreground"
                >
                  <span className="mr-2">{group.permit.number}</span>
                  <span className="font-normal text-muted-foreground">
                    {unitLabel(group.permit.unit)}
                    {" · "}
                    {permitPeriod(
                      group.permit.start_date,
                      group.permit.end_date,
                    )}
                  </span>
                  <PermitStatusBadge
                    status={group.permit.status}
                    className="ml-2 align-middle"
                  />
                </TableCell>
              </TableRow>,
              ...group.wastes.map((item) => {
                const selected =
                  group.permit.id === selectedPermitId &&
                  item.waste.id === selectedWasteId;
                const select = () =>
                  onSelect({
                    permit_id: group.permit.id,
                    waste_id: item.waste.id,
                  });
                const uom = UOM_LABEL[item.waste.uom];
                const overLimit = isAmountOverLimit(item.amount, item.limit);
                const percent = getPercent(item.amount, item.limit);

                return (
                  <TableRow
                    key={`${group.permit.id}:${item.waste.id}`}
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
                      {" "}
                      <span className="text-xs">
                        {" "}
                        {`${item.amount} из ${formatBalanceAmount(item.limit)} ${uom}`}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        overLimit
                          ? "font-medium text-destructive"
                          : !isNonZeroAmount(item.amount) &&
                              "text-muted-foreground",
                      )}
                      title={
                        overLimit
                          ? "Факт за год выше лимита разрешения"
                          : undefined
                      }
                    >
                      {percent !== null ? (
                        <FillMeter percent={percent} leading="" />
                      ) : null}
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
