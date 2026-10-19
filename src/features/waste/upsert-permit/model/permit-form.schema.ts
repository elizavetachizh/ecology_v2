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

const limitAmount = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (!/^\d+(\.\d{1,6})?$/.test(value)) return false;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 && n <= 999_999.999_999;
  }, "Лимит должен быть больше 0 и не больше 999999.999999");

const limitWasteRow = z.object({
  waste_id: z.union([z.uuid(), z.literal("")]),
  amount: limitAmount,
  label: z.string(),
  uomLabel: z.string(),
});

function addDuplicateAndAmountIssues(
  rows: { waste_id: string; amount: string }[],
  field: "burial_wastes" | "storage_wastes",
  emptyAmountMessage: string,
  ctx: {
    addIssue: (issue: {
      code: "custom";
      path: (string | number)[];
      message: string;
    }) => void;
  },
) {
  const seen = new Set<string>();
  rows.forEach((item, index) => {
    if (!item.waste_id) return;
    if (!item.amount) {
      ctx.addIssue({
        code: "custom",
        path: [field, index, "amount"],
        message: emptyAmountMessage,
      });
    }
    if (seen.has(item.waste_id)) {
      ctx.addIssue({
        code: "custom",
        path: [field, index, "waste_id"],
        message: "Этот отход уже есть в перечне",
      });
    }
    seen.add(item.waste_id);
  });
}

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
    burial_wastes: z.array(limitWasteRow),
    storage_wastes: z.array(limitWasteRow),
  })
  .superRefine((values, ctx) => {
    if (values.end_date && values.end_date < values.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Дата окончания не может быть раньше даты начала",
      });
    }
    addDuplicateAndAmountIssues(
      values.burial_wastes,
      "burial_wastes",
      "Укажите лимит на захоронение",
      ctx,
    );
    addDuplicateAndAmountIssues(
      values.storage_wastes,
      "storage_wastes",
      "Укажите лимит на хранение",
      ctx,
    );
  });

export type PermitFormValues = z.infer<typeof permitFormSchema>;
export type PermitFormLimitWaste = PermitFormValues["burial_wastes"][number];

export const emptyPermitLimitWasteRow: PermitFormLimitWaste = {
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
  burial_wastes: [{ ...emptyPermitLimitWasteRow }],
  storage_wastes: [{ ...emptyPermitLimitWasteRow }],
};
