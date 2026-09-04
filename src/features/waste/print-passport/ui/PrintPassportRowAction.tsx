import { Printer } from "lucide-react";
import { DataTableRowAction } from "../../../../shared/ui";
import { usePrintPassport } from "../model/use-print-passport";

type PrintPassportRowActionProps = {
  passportId: string;
  number: string;
};

export function PrintPassportRowAction({
  passportId,
  number,
}: PrintPassportRowActionProps) {
  const { print, pending } = usePrintPassport();

  return (
    <>
      <DataTableRowAction
        label="Печать Word"
        disabled={pending}
        onClick={() => print(passportId, number, "docx")}
      >
        <Printer />
        Word
      </DataTableRowAction>
      <DataTableRowAction
        label="Печать PDF"
        disabled={pending}
        onClick={() => print(passportId, number, "pdf")}
      >
        <Printer />
        PDF
      </DataTableRowAction>
    </>
  );
}
