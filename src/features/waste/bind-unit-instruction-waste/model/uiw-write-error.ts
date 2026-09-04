import { ApiError } from "../../../../shared/api/api-client";

export function uiwWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Привязка отхода не найдена.";
  }
  if (error instanceof ApiError && error.status === 409) {
    return "Такая привязка отхода уже существует.";
  }

  return error instanceof Error
    ? error.message
    : "Не удалось сохранить привязку отхода";
}

export function uiwDeleteErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось удалить привязку отхода";
}
