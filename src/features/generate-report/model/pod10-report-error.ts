import { ApiError } from "../../../shared/api/api-client";
import { reportPdfConversionErrorMessage } from "./report-error";

export function pod10ReportErrorMessage(error: unknown): string {
  const pdf = reportPdfConversionErrorMessage(error);
  if (pdf) return pdf;
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте период и территорию: дата начала не позже окончания, район должен относиться к региону.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте параметры отчёта: территорию и период.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сформировать отчёт ПОД-10";
}
