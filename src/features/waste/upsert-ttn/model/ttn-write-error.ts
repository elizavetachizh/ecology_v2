import { ApiError } from "../../../../shared/api/api-client";

export function ttnWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Структурная единица или договор не найдены.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Нужен действующий договор утилизации.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля ТТН: номер и дата перевозки.";
  }
  return error instanceof Error ? error.message : "Не удалось сохранить ТТН";
}

export function ttnDeleteErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Не удалось удалить ТТН";
}
