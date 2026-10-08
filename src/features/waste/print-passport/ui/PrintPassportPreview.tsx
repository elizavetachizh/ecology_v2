import { useEffect, useEffectEvent } from "react";
import { usePreviewPassport } from "../model/use-preview-passport";
import { PassportPreviewPanel } from "./PassportPreviewPanel";

type PreviewPassport = {
  id: string;
  number: string;
};

type PrintPassportPreviewProps = {
  passport: PreviewPassport | null;
  onClose: () => void;
};

export function PrintPassportPreview({
  passport,
  onClose,
}: PrintPassportPreviewProps) {
  const preview = usePreviewPassport({
    passportId: passport?.id ?? "",
    number: passport?.number ?? "",
  });

  const startPreview = useEffectEvent(() => {
    preview.start();
  });

  useEffect(() => {
    if (!passport?.id) return;
    startPreview();
  }, [passport?.id, passport?.number]);

  return (
    <PassportPreviewPanel
      number={passport?.number ?? ""}
      preview={preview}
      onClose={onClose}
    />
  );
}
