import { z } from "zod";
import {
  PassportStatusValues,
  PassportTransportTypeValues,
} from "../../../../entities/waste/passports";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

const optionalUuid = z.union([z.string().uuid(), z.literal("")]);

export const passportFormSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(1, "Укажите номер паспорта")
      .max(255, "Не более 255 символов"),
    date: isoDate.min(1, "Укажите дату вывоза"),
    unit_id: z.string().uuid("Выберите структурную единицу"),
    status: z.enum(PassportStatusValues),
    recycling_contract_id: z.string().uuid("Выберите договор утилизации"),
    waste_ids: z
      .array(z.string().uuid())
      .min(1, "Добавьте хотя бы один отход из перечня договора"),
    transport_type: z.enum(PassportTransportTypeValues, {
      error: "Выберите, кто перевозит",
    }),
    transport_contract_id: optionalUuid,
    waste_producer_id: optionalUuid,
  })
  .superRefine((values, ctx) => {
    if (values.transport_type === "transport_contract") {
      if (!values.transport_contract_id) {
        ctx.addIssue({
          code: "custom",
          path: ["transport_contract_id"],
          message: "Выберите договор перевозки",
        });
      }
    }

    const seen = new Set<string>();
    values.waste_ids.forEach((id, index) => {
      if (seen.has(id)) {
        ctx.addIssue({
          code: "custom",
          path: ["waste_ids", index],
          message: "Этот отход уже добавлен",
        });
      }
      seen.add(id);
    });
  });

export type PassportFormValues = z.infer<typeof passportFormSchema>;

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const passportFormDefaultValues: PassportFormValues = {
  number: "",
  date: todayIsoDate(),
  unit_id: "",
  status: "active",
  recycling_contract_id: "",
  waste_ids: [],
  transport_type: "self",
  transport_contract_id: "",
  waste_producer_id: "",
};
