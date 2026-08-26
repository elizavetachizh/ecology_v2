import { z } from "zod";
import { PassportTransportTypeValues } from "../../../../entities/waste/passports";

export const PASSPORT_WASTE_PRODUCER_TYPE_LABEL = {
  self: "Самостоятельно",
  counterparty: "Контрагент",
} as const;

export type PassportWasteProducerType =
  keyof typeof PASSPORT_WASTE_PRODUCER_TYPE_LABEL;

export const PassportWasteProducerTypeValues = Object.keys(
  PASSPORT_WASTE_PRODUCER_TYPE_LABEL,
) as [PassportWasteProducerType, ...PassportWasteProducerType[]];

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
    recycling_contract_id: z.string().uuid("Выберите договор утилизации"),
    waste_ids: z
      .array(z.string().uuid())
      .min(1, "Добавьте хотя бы один отход из перечня договора"),
    transport_type: z.enum(PassportTransportTypeValues, {
      error: "Выберите, кто перевозит",
    }),
    transport_contract_id: optionalUuid,
    waste_producer_type: z.enum(PassportWasteProducerTypeValues, {
      error: "Выберите производителя отходов",
    }),
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

    if (values.waste_producer_type === "counterparty") {
      if (!values.waste_producer_id) {
        ctx.addIssue({
          code: "custom",
          path: ["waste_producer_id"],
          message: "Выберите контрагента",
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
  recycling_contract_id: "",
  waste_ids: [],
  transport_type: "self",
  transport_contract_id: "",
  waste_producer_type: "self",
  waste_producer_id: "",
};
