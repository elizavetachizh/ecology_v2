import { Button } from "../button";
import { cn } from "../../lib/cn";

export type DataTablePaginationProps = {
  total: number;
  limit: number;
  offset: number;
  onOffsetChange: (offset: number) => void;
  disabled?: boolean;
  className?: string;
  /** Подписи кнопок */
  previousLabel?: string;
  nextLabel?: string;
};

export function DataTablePagination({
  total,
  limit,
  offset,
  onOffsetChange,
  disabled = false,
  className,
  previousLabel = "Назад",
  nextLabel = "Вперёд",
}: DataTablePaginationProps) {
  const safeLimit = Math.max(1, limit);
  const safeOffset = Math.max(0, offset);
  const from = total === 0 ? 0 : safeOffset + 1;
  const to = Math.min(safeOffset + safeLimit, total);
  const canPrev = safeOffset > 0;
  const canNext = safeOffset + safeLimit < total;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <span>
        {total === 0 ? "Нет записей" : `Показано ${from}–${to} из ${total}`}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev || disabled}
          onClick={() => onOffsetChange(Math.max(0, safeOffset - safeLimit))}
        >
          {previousLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext || disabled}
          onClick={() => onOffsetChange(safeOffset + safeLimit)}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
