/** `lock_date` — последний закрытый день включительно. ISO `YYYY-MM-DD` сравниваются лексикографически. */
export function isOperationDateLocked(
  operationDate: string,
  lockDate: string | null,
): boolean {
  if (!lockDate) return false;
  return operationDate <= lockDate;
}
