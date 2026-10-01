import { ApiError } from "../../../../shared/api/api-client";

export function personWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "Ответственный с таким идентификатором Белтопгаз уже есть.";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "Подразделение не найдено.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте наименование и ФИО.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить ответственного";
}
