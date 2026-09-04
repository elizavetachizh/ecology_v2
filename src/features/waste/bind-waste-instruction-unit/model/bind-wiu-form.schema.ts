import { z } from "zod";

const transportUnitSchema = z
  .string()
  .trim()
  .min(1, "Укажите транспортную единицу")
  .regex(
    /^\d+(\.\d{1,6})?$/,
    "Число от 0 до 999999.999999, не более 6 знаков после запятой",
  )
  .refine((value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 999_999.999_999;
  }, "Значение вне допустимого диапазона");

export const bindWiuFormSchema = z.object({
  unit_id: z.uuid("Выберите структурную единицу ПОД-9"),
  waste_source_ids: z.array(z.uuid("Выберите источники образования")),
  transport_unit: transportUnitSchema,
});

export type BindWiuFormValues = z.infer<typeof bindWiuFormSchema>;

export const bindWiuFormDefaultValues: BindWiuFormValues = {
  unit_id: "",
  waste_source_ids: [],
  transport_unit: "0",
};
