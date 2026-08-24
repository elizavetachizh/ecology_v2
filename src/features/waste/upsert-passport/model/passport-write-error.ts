import { ApiError } from "../../../../shared/api/api-client";

export function passportWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Структурная единица, договор, отход или производитель не найдены.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return "Проверьте договор и отходы: договор утилизации с перечнем, отходы только из него, без дублей. Договор перевозки обязателен только при способе «по договору перевозки».";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте поля паспорта: номер, дата вывоза, статус.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить паспорт";
}

export function passportDeleteErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Не удалось удалить паспорт";
}
