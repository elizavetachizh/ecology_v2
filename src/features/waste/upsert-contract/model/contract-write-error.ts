import { ApiError } from "../../../../shared/api/api-client";

export function contractWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Контрагент или отход не найден.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте даты и перечень отходов: окончание не раньше начала, отходы без дублей.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля договора: номер, даты, сумма если указана.";
  }
  return error instanceof Error ? error.message : "Не удалось сохранить договор";
}

export function contractDeleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) {
    return "Нельзя удалить договор: на него ссылается сопроводительный паспорт или ТТН.";
  }
  return error instanceof Error ? error.message : "Не удалось удалить договор";
}
