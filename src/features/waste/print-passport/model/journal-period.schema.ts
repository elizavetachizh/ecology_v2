import { z } from "zod";
import {
  isoDateZodSchema,
  todayIsoDate,
  yearStartIsoDate,
} from "../../../../shared/lib/format-date";

const isoDate = isoDateZodSchema();

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

export function journalPeriodDefaults(
  startDate?: string,
  endDate?: string,
): JournalPeriodValues {
  return {
    start_date: startDate || yearStartIsoDate(),
    end_date: endDate || todayIsoDate(),
  };
}
