import { ApiError } from "../../../../shared/api/api-client";

export function standardWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Подразделение или отход не найден.";
  }
  if (error instanceof ApiError && error.status === 409) {
    return "Для этого подразделения уже есть норматив с такой датой начала.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте перечень отходов: без дублей и с указанным нормативом.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля норматива: дата начала, подразделение, норматив больше 0.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить норматив";
}

export function standardDeleteErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось удалить норматив";
}
