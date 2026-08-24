import { z } from "zod";
import {
  ContractStatusValues,
  ContractTypeValues,
} from "../../../../entities/waste/contracts";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

const optionalPositiveDecimal = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (!/^\d+(\.\d{1,6})?$/.test(value)) return false;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 && n <= 999_999_999.999_999;
  }, "Сумма должна быть больше 0, не более 6 знаков после запятой");

const optionalNonNegativeDecimal = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (!/^\d+(\.\d{1,6})?$/.test(value)) return false;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 999_999_999.999_999;
  }, "Стоимость — число 0 или больше, не более 6 знаков после запятой");

export const contractFormSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(1, "Укажите номер договора")
      .max(255, "Не более 255 символов"),
    start_date: isoDate,
    end_date: z.union([isoDate, z.literal("")]),
    contract_type: z.enum(ContractTypeValues, {
      error: "Выберите тип договора",
    }),
    status: z.enum(ContractStatusValues),
    counterparty_id: z.string().uuid("Выберите контрагента"),
    amount: optionalPositiveDecimal,
    wastes: z.array(
      z.object({
        waste_id: z.string().uuid(),
        cost_per_unit: optionalNonNegativeDecimal,
        label: z.string(),
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
    values.wastes.forEach((item, index) => {
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

export type ContractFormValues = z.infer<typeof contractFormSchema>;
export type ContractFormWaste = ContractFormValues["wastes"][number];

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const contractFormDefaultValues: ContractFormValues = {
  number: "",
  start_date: todayIsoDate(),
  end_date: "",
  contract_type: "recycling",
  status: "active",
  counterparty_id: "",
  amount: "",
  wastes: [],
};
