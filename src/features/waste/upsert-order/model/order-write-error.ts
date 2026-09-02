import { ApiError } from "../../../../shared/api/api-client";

export function orderWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Подразделение не найдено.";
  }
  if (error instanceof ApiError && error.status === 409) {
    return "Для этого подразделения уже есть приказ с такой датой начала.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля приказа: номер, дата начала, подразделение.";
  }
  return error instanceof Error ? error.message : "Не удалось сохранить приказ";
}

export function orderDeleteErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Не удалось удалить приказ";
}
