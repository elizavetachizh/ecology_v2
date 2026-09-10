import { ApiError } from "../../../../shared/api/api-client.ts";

export function pod10ReportErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Не удалось сформировать отчёт ПОД-10.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте период: дата начала не может быть позже даты окончания.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте параметры отчёта: регион, район и период.";
  }
  if (error instanceof ApiError && error.status === 503) {
    return "Конвертация PDF недоступна. Excel скачать можно.";
  }
  if (error instanceof ApiError && error.status === 502) {
    return "Не удалось сформировать PDF. Попробуйте позже или скачайте Excel.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сформировать отчёт ПОД-10";
}
