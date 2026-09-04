import { ApiError } from "../../../../shared/api/api-client";

export function wiuWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Привязка ПОД-9 не найдена.";
  }
  if (error instanceof ApiError && error.status === 409) {
    return "Такая привязка ПОД-9 уже существует.";
  }

  return error instanceof Error
    ? error.message
    : "Не удалось сохранить привязку ПОД-9";
}

export function wiuDeleteErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось удалить привязку ПОД-9";
}
