import { z } from "zod";
import { InstructionStatusValues } from "../../../../entities/waste/instructions";

export const instructionStatusSchema = z.enum(InstructionStatusValues);

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД")
  .or(z.literal(""));

export const instructionFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Укажите наименование")
      .max(255, "Не более 255 символов"),
    short_name: z.string().max(255, "Не более 255 символов"),
    start_date: optionalDate,
    end_date: optionalDate,
    status: instructionStatusSchema,
  })
  .superRefine((values, ctx) => {
    const start = values.start_date;
    const end = values.end_date;

    if (values.status === "active") {
      if (!start) {
        ctx.addIssue({
          code: "custom",
          path: ["start_date"],
          message: "Для статуса «Действует» укажите дату начала",
        });
      }
      if (!end) {
        ctx.addIssue({
          code: "custom",
          path: ["end_date"],
          message: "Для статуса «Действует» укажите дату окончания",
        });
      }
    }

    if (start && end && end < start) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Дата окончания не может быть раньше даты начала",
      });
    }
  });

export type InstructionFormValues = z.infer<typeof instructionFormSchema>;

export const instructionFormDefaultValues: InstructionFormValues = {
  name: "",
  short_name: "",
  start_date: "",
  end_date: "",
  status: "draft",
};
