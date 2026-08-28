import { ApiError } from "../../../shared/api/api-client";

export function pod9ReportErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Место учёта или инструкция не найдены в текущей организации.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте период: дата начала не может быть позже даты окончания.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте параметры отчёта: место учёта, инструкция и период.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сформировать отчёт ПОД-9";
}
