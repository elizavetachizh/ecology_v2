import { ApiError } from "../../../shared/api/api-client";

export function reportPdfConversionErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 503) {
    return "Конвертация PDF недоступна. Excel скачать можно.";
  }
  if (error.status === 502) {
    return "Не удалось сформировать PDF. Попробуйте позже или скачайте Excel.";
  }
  return null;
}

export function reportPeriodErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте период: дата начала не может быть позже даты окончания.";
  }
  return null;
}
