import { useRef, useState } from "react";
import { Download, Eye, LoaderCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../shared/ui";
import { previewPod9Report } from "../api/previewPod9Report";
import type {
  Pod9ReportPreviewParams,
  ReportPreview,
} from "../model/preview.types";

type Pod9ReportPreviewButtonProps = {
  params: Pod9ReportPreviewParams;
};

export function Pod9ReportPreviewButton({
  params,
}: Pod9ReportPreviewButtonProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const loadPreview = async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setOpen(true);
    setPreview(null);
    setActiveSheet(0);
    setError(null);
    setIsLoading(true);

    try {
      setPreview(await previewPod9Report(params, controller.signal));
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить предпросмотр",
      );
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      requestRef.current?.abort();
      setIsLoading(false);
    }
  };

  const downloadPreview = () => {
    if (!preview) return;
    const url = URL.createObjectURL(preview.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = preview.fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const sheet = preview?.sheets[activeSheet];
  const columnCount = sheet
    ? Math.max(0, ...sheet.rows.map((row) => row.length))
    : 0;

  return (
    <>
      <Button type="button" size="sm" onClick={() => void loadPreview()}>
        <Eye />
        Предпросмотр
      </Button>

      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className="h-[min(90vh,860px)] max-h-[90vh] max-w-[min(96vw,1440px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0">
          <ModalHeader className="border-b border-border px-6 py-5">
            <ModalTitle>Предпросмотр отчёта ПОД-9</ModalTitle>
            <ModalDescription>
              Период: {params.startDate} — {params.endDate}
              {preview ? ` · ${preview.fileName}` : ""}
            </ModalDescription>
          </ModalHeader>

          <div className="min-h-0 overflow-hidden px-6 py-4">
            {isLoading ? (
              <div
                className="flex h-full min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
                role="status"
              >
                <LoaderCircle className="size-7 animate-spin text-primary" />
                <span className="text-sm">
                  Формируем и загружаем предпросмотр…
                </span>
              </div>
            ) : null}

            {error ? (
              <div className="space-y-4">
                <Alert variant="error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void loadPreview()}
                >
                  Повторить
                </Button>
              </div>
            ) : null}

            {preview && sheet ? (
              <div className="flex h-full min-h-0 flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="flex max-w-full gap-1 overflow-x-auto"
                    role="tablist"
                    aria-label="Листы книги"
                  >
                    {preview.sheets.map((item, index) => (
                      <button
                        key={`${item.name}-${index}`}
                        type="button"
                        role="tab"
                        aria-selected={activeSheet === index}
                        onClick={() => setActiveSheet(index)}
                        className={
                          activeSheet === index
                            ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                            : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {sheet.rows.length} строк · {columnCount} столбцов
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-background">
                  {sheet.rows.length > 0 ? (
                    <table className="w-max min-w-full border-collapse text-xs">
                      <tbody>
                        {sheet.rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="odd:bg-muted/25 hover:bg-accent/50"
                          >
                            {row.map((cell, cellIndex) =>
                              cell.hidden ? null : (
                                <td
                                  key={cellIndex}
                                  rowSpan={cell.rowSpan}
                                  colSpan={cell.colSpan}
                                  className="min-w-28 max-w-80 whitespace-pre-wrap border-r border-b border-border px-2.5 py-2 align-top"
                                >
                                  {cell.value || "\u00A0"}
                                </td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                      Лист не содержит данных
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <ModalFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Закрыть
            </Button>
            <Button
              type="button"
              onClick={downloadPreview}
              disabled={!preview}
            >
              <Download />
              Скачать Excel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
