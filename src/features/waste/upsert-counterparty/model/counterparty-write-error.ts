import { ApiError } from "../../../../shared/api/api-client";

export function counterpartyWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "Контрагент с таким УНП уже есть в этой организации.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля. УНП — ровно 9 цифр, если указан; наименование обязательно.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить контрагента";
}
