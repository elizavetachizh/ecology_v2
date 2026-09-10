import { ApiError } from "../../../shared/api/api-client";
import {
  reportPdfConversionErrorMessage,
  reportPeriodErrorMessage,
} from "./report-error";

export function pod9ReportErrorMessage(error: unknown): string {
  const pdf = reportPdfConversionErrorMessage(error);
  if (pdf) return pdf;
  const period = reportPeriodErrorMessage(error);
  if (period) return period;
  if (error instanceof ApiError && error.status === 404) {
    return "Место учёта или инструкция не найдены в текущей организации.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте параметры отчёта: место учёта, инструкция и период.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сформировать отчёт ПОД-9";
}
