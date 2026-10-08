import { Printer } from "lucide-react";
import { DataTableRowAction } from "../../../../shared/ui";

type PrintPassportRowActionProps = {
  onSelect: () => void;
};

export function PrintPassportRowAction({
  onSelect,
}: PrintPassportRowActionProps) {
  return (
    <DataTableRowAction label="Сформировать паспорт" onSelect={onSelect}>
      <Printer />
      Сформировать паспорт
    </DataTableRowAction>
  );
}
