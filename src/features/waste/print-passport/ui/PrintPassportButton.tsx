import { Printer } from "lucide-react";
import { Button } from "../../../../shared/ui";
import { usePreviewPassport } from "../model/use-preview-passport";
import { PassportPreviewPanel } from "./PassportPreviewPanel";

type PrintPassportButtonProps = {
  passportId: string;
  number: string;
};

export function PrintPassportButton({
  passportId,
  number,
}: PrintPassportButtonProps) {
  const preview = usePreviewPassport({ passportId, number });

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={preview.start}>
        <Printer />
        Сформировать паспорт
      </Button>
      <PassportPreviewPanel number={number} preview={preview} />
    </>
  );
}
