import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

export const journalPeriodSchema = z
  .object({
    start_date: isoDate,
    end_date: isoDate,
  })
  .superRefine((values, ctx) => {
    if (values.end_date < values.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Дата окончания не может быть раньше даты начала",
      });
    }
  });

export type JournalPeriodValues = z.infer<typeof journalPeriodSchema>;

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function yearStartIsoDate(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export function journalPeriodDefaults(
  startDate?: string,
  endDate?: string,
): JournalPeriodValues {
  return {
    start_date: startDate || yearStartIsoDate(),
    end_date: endDate || todayIsoDate(),
  };
}
