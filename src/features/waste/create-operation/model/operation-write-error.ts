import { ApiError } from "../../../../shared/api/api-client";

export function operationWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Операция, источник образования или связанная сущность не найдены.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Не удалось сохранить: проверьте дату, количество и остаток. Отклонённую операцию изменить нельзя.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте дату и количество: дата в формате ГГГГ-ММ-ДД, количество больше 0.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить операцию";
}
