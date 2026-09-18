import { ApiError } from "../../../../shared/api/api-client";

export function standardWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Место учёта или отход не найден.";
  }
  if (error instanceof ApiError && error.status === 409) {
    return "Уже есть норматив с такой датой начала.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте перечень: без дублей мест учёта и отходов внутри одного места учёта.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля норматива: дата начала, норматив больше 0.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить норматив";
}

export function standardDeleteErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Не удалось удалить норматив";
}
