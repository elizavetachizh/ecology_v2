import { ApiError } from "../../../shared/api/api-client";
import { reportPdfConversionErrorMessage } from "./report-error";

export function statReportErrorMessage(error: unknown): string {
  const pdf = reportPdfConversionErrorMessage(error);
  if (pdf) return pdf;
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте отчётный год: значение от 1900 до 2100.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сформировать отчёт 1-отходы";
}
