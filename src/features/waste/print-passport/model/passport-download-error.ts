import { ApiError } from "../../../../shared/api/api-client";

export function passportDownloadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Паспорт не найден.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте период: дата начала не может быть позже даты окончания, не более 5000 записей.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте параметры печати.";
  }
  if (error instanceof ApiError && error.status === 503) {
    return "Конвертация PDF недоступна. Скачайте документ в другом формате.";
  }
  if (error instanceof ApiError && error.status === 502) {
    return "Не удалось сформировать PDF. Попробуйте позже или скачайте документ в другом формате.";
  }
  return error instanceof Error ? error.message : "Не удалось скачать файл";
}
