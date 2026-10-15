import { ApiError } from "../../../../shared/api/api-client";

export function vehicleWriteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "Транспорт с таким госномером или ID Белтопгаз уже есть.";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Проверьте марку, модель, госномер и массу.";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "Транспортное средство не найдено.";
  }
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить транспортное средство";
}
