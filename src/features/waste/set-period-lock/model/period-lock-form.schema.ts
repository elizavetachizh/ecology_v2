import { z } from "zod";
import { isoDateZodSchema } from "../../../../shared/lib/format-date";

/** Пустая строка — поле ещё не заполнено. Сохранение её не отправляет. */
export const periodLockFormSchema = z
  .object({
    lock_date: isoDateZodSchema().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.lock_date) return;
    ctx.addIssue({
      code: "custom",
      path: ["lock_date"],
      message: "Укажите последний закрытый день",
    });
  });

export type PeriodLockFormValues = z.infer<typeof periodLockFormSchema>;

export function periodLockFormDefaults(
  lockDate: string | null | undefined,
): PeriodLockFormValues {
  return { lock_date: lockDate ?? "" };
}
