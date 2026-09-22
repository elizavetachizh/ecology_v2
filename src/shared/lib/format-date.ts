import { z } from "zod";

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}

/** ISO datetime (`2026-03-01T00:00:00Z`) → `01.03.2026, 03:00` in local TZ. */
export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toIsoDate(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

export function yearStartIsoDate(): string {
  return toIsoDate(new Date(new Date().getFullYear(), 0, 1));
}

export function isoDateZodSchema() {
  return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");
}

/** Calendar date plus `years`. Feb 29 becomes Mar 1 in a non-leap year. */
export function addYearsIsoDate(isoDate: string, years: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day - 1));
  date.setUTCFullYear(date.getUTCFullYear() + years);
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
