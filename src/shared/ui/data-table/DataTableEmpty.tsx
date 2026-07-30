import { cn } from "../../lib/cn";

type DataTableEmptyProps = {
  title?: string;
  description?: string;
  className?: string;
  colSpan: number;
};

export function DataTableEmpty({
  title = "Нет данных",
  description = "По выбранным условиям записи не найдены.",
  className,
  colSpan,
}: DataTableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn("h-28 px-3 text-center align-middle", className)}
      >
        <div className="mx-auto max-w-sm space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </td>
    </tr>
  );
}
