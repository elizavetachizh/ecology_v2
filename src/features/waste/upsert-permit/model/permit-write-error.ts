import { ApiError } from "../../../../shared/api/api-client";

export function permitWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Подразделение или отход не найден.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте даты и перечень отходов: окончание не раньше начала, отходы без дублей.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля разрешения: номер, даты, лимит больше 0.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить разрешение";
}

export function permitDeleteErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось удалить разрешение";
}
