import { z } from "zod";
import { COUNTERPARTY_UNP_PATTERN } from "../../../../entities/waste/counterparties";

export const counterpartyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите наименование")
    .max(255, "Не более 255 символов"),
  full_name: z.string().max(255, "Не более 255 символов"),
  unp: z
    .string()
    .trim()
    .refine((value) => value === "" || COUNTERPARTY_UNP_PATTERN.test(value), {
      message: "УНП — ровно 9 цифр",
    }),
  address: z.string().max(255, "Не более 255 символов"),
  contact: z.string().max(255, "Не более 255 символов"),
  is_individual: z.boolean(),
  is_active: z.boolean(),
});

export type CounterpartyFormValues = z.infer<typeof counterpartyFormSchema>;

export const counterpartyFormDefaultValues: CounterpartyFormValues = {
  name: "",
  full_name: "",
  unp: "",
  address: "",
  contact: "",
  is_individual: false,
  is_active: true,
};

export function sanitizeUnpInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 9);
}
