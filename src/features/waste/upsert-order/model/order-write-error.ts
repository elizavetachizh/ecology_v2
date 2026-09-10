import { ApiError } from "../../../../shared/api/api-client";

export function orderWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Приказ или подразделение не найдено.";
  }
  if (error instanceof ApiError && error.status === 409) {
    return "Уже есть приказ с такой датой начала для этого подразделения или для всего предприятия.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля приказа: номер и дата начала.";
  }
  return error instanceof Error ? error.message : "Не удалось сохранить приказ";
}

export function orderDeleteErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Не удалось удалить приказ";
}
