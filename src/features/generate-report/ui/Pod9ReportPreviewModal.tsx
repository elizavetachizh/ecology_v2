import { Download, LoaderCircle } from "lucide-react";
import type { ReportPreview } from "../model/preview.types";
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

type Pod9ReportPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
  preview: ReportPreview | null;
  activeSheet: number;
  onActiveSheetChange: (index: number) => void;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
  onDownload: () => void;
};

export function Pod9ReportPreviewModal({
  open,
  onOpenChange,
  periodLabel,
  preview,
  activeSheet,
  onActiveSheetChange,
  error,
  isLoading,
  onRetry,
  onDownload,
}: Pod9ReportPreviewModalProps) {
  const sheet = preview?.sheets[activeSheet];
  const columnCount = sheet
    ? Math.max(0, ...sheet.rows.map((row) => row.length))
    : 0;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="h-[min(90vh,860px)] max-h-[90vh] max-w-[min(96vw,1440px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0">
        <ModalHeader className="border-b border-border px-6 py-5">
          <ModalTitle>Предпросмотр отчёта ПОД-9</ModalTitle>
          <ModalDescription>
            Период: {periodLabel}
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
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
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
                      onClick={() => onActiveSheetChange(index)}
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
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
          <Button type="button" onClick={onDownload} disabled={!preview}>
            <Download />
            Скачать Excel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
