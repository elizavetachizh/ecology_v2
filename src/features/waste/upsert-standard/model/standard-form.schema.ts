import { z } from "zod";

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

export const standardFormSchema = z
  .object({
    start_date: isoDate,
    unit_id: z.string().uuid("Выберите подразделение"),
    wastes: z.array(
      z.object({
        waste_id: z.union([z.string().uuid(), z.literal("")]),
        amount: wasteAmount,
        label: z.string(),
        uomLabel: z.string(),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    const seen = new Set<string>();
    values.wastes.forEach((item, index) => {
      if (!item.waste_id) return;
      if (!item.amount) {
        ctx.addIssue({
          code: "custom",
          path: ["wastes", index, "amount"],
          message: "Укажите норматив образования",
        });
      }
      if (seen.has(item.waste_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["wastes", index, "waste_id"],
          message: "Этот отход уже есть в перечне",
        });
      }
      seen.add(item.waste_id);
    });
  });

export type StandardFormValues = z.infer<typeof standardFormSchema>;
export type StandardFormWaste = StandardFormValues["wastes"][number];

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const emptyStandardWasteRow: StandardFormWaste = {
  waste_id: "",
  amount: "",
  label: "",
  uomLabel: "",
};

export const standardFormDefaultValues: StandardFormValues = {
  start_date: todayIsoDate(),
  unit_id: "",
  wastes: [{ ...emptyStandardWasteRow }],
};
