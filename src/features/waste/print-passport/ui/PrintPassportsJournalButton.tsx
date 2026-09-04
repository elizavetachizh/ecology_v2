import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "../../../../shared/ui";
import { PrintPassportsJournalModal } from "./PrintPassportsJournalModal";

type PrintPassportsJournalButtonProps = {
  defaultStartDate?: string;
  defaultEndDate?: string;
};

export function PrintPassportsJournalButton({
  defaultStartDate,
  defaultEndDate,
}: PrintPassportsJournalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Printer />
        Печать журнала
      </Button>
      <PrintPassportsJournalModal
        open={open}
        onOpenChange={setOpen}
        defaultStartDate={defaultStartDate}
        defaultEndDate={defaultEndDate}
      />
    </>
  );
}
