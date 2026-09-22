import { z } from "zod";
import {
  addYearsIsoDate,
  isoDateZodSchema,
  todayIsoDate,
} from "../../../../shared/lib/format-date";

export const PERMIT_TERM_YEARS = 5;

export function permitEndDateFromStart(startDate: string): string {
  return addYearsIsoDate(startDate, PERMIT_TERM_YEARS);
}

/**
 * Keep end_date at start+5 years until the user sets a different end.
 * Returns null when the current end must be left as-is.
 */
export function nextSyncedPermitEndDate(params: {
  previousStart: string;
  nextStart: string;
  currentEnd: string;
}): string | null {
  const { previousStart, nextStart, currentEnd } = params;
  if (!nextStart) return null;
  const stillLinked =
    currentEnd === "" || currentEnd === permitEndDateFromStart(previousStart);
  if (!stillLinked) return null;
  return permitEndDateFromStart(nextStart);
}

const isoDate = isoDateZodSchema();

const burialAmount = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (!/^\d+(\.\d{1,6})?$/.test(value)) return false;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 && n <= 999_999.999_999;
  }, "Лимит должен быть больше 0 и не больше 999999.999999");

export const permitFormSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(1, "Укажите номер разрешения")
      .max(255, "Не более 255 символов"),
    start_date: isoDate,
    end_date: z.union([isoDate, z.literal("")]),
    unit_id: z
      .union([
        z.uuid({ message: "Выберите корректное подразделение" }),
        z.literal(""),
        z.null(),
      ])
      .optional(),
    burial_wastes: z.array(
      z.object({
        waste_id: z.union([z.uuid(), z.literal("")]),
        amount: burialAmount,
        label: z.string(),
        uomLabel: z.string(),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    if (values.end_date && values.end_date < values.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Дата окончания не может быть раньше даты начала",
      });
    }
    const seen = new Set<string>();
    values.burial_wastes.forEach((item, index) => {
      if (!item.waste_id) return;
      if (!item.amount) {
        ctx.addIssue({
          code: "custom",
          path: ["burial_wastes", index, "amount"],
          message: "Укажите лимит на захоронение",
        });
      }
      if (seen.has(item.waste_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["burial_wastes", index, "waste_id"],
          message: "Этот отход уже есть в перечне",
        });
      }
      seen.add(item.waste_id);
    });
  });

export type PermitFormValues = z.infer<typeof permitFormSchema>;
export type PermitFormBurialWaste = PermitFormValues["burial_wastes"][number];

export const emptyPermitBurialWasteRow: PermitFormBurialWaste = {
  waste_id: "",
  amount: "",
  label: "",
  uomLabel: "",
};

const startDate = todayIsoDate();
const endDate = permitEndDateFromStart(startDate);

export const permitFormDefaultValues: PermitFormValues = {
  number: "",
  start_date: startDate,
  end_date: endDate,
  unit_id: "",
  burial_wastes: [{ ...emptyPermitBurialWasteRow }],
};
