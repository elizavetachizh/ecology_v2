import { z } from "zod";
import { todayIsoDate } from "../../../../shared/lib/format-date";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

const wasteAmount = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (!/^\d+(\.\d{1,6})?$/.test(value)) return false;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 && n <= 999_999.999_999;
  }, "Норматив должен быть больше 0 и не больше 999999.999999");

const wasteRowSchema = z.object({
  waste_id: z.union([z.uuid(), z.literal("")]),
  amount: wasteAmount,
  label: z.string(),
  uomLabel: z.string(),
});

export const standardFormSchema = z
  .object({
    start_date: isoDate,
    units: z.array(
      z.object({
        unit_id: z.uuid({ message: "Выберите корректное место учёта" }),
        unit_label: z.string(),
        wastes: z.array(wasteRowSchema),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    const seenUnits = new Set<string>();
    values.units.forEach((unit, unitIndex) => {
      if (seenUnits.has(unit.unit_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["units", unitIndex, "unit_id"],
          message: "Это место учёта уже есть в перечне",
        });
      }
      seenUnits.add(unit.unit_id);

      const seenWastes = new Set<string>();
      unit.wastes.forEach((item, index) => {
        if (!item.waste_id) return;
        if (!item.amount) {
          ctx.addIssue({
            code: "custom",
            path: ["units", unitIndex, "wastes", index, "amount"],
            message: "Укажите норматив образования",
          });
        }
        if (seenWastes.has(item.waste_id)) {
          ctx.addIssue({
            code: "custom",
            path: ["units", unitIndex, "wastes", index, "waste_id"],
            message: "Этот отход уже есть в перечне",
          });
        }
        seenWastes.add(item.waste_id);
      });
    });
  });

export type StandardFormValues = z.infer<typeof standardFormSchema>;
export type StandardFormUnit = StandardFormValues["units"][number];
export type StandardFormWaste = StandardFormUnit["wastes"][number];

export const emptyStandardWasteRow: StandardFormWaste = {
  waste_id: "",
  amount: "",
  label: "",
  uomLabel: "",
};

export const standardFormDefaultValues: StandardFormValues = {
  start_date: todayIsoDate(),
  units: [],
};
