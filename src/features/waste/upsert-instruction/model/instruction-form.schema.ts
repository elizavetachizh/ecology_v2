import { z } from "zod";

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
    status: z.enum(["draft", "active", "inactive"]),
  })
  .superRefine((values, ctx) => {
    if (
      values.start_date &&
      values.end_date &&
      values.end_date < values.start_date
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Дата окончания не может быть раньше даты начала",
      });
    }

    if (values.status !== "active") return;

    if (!values.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["start_date"],
        message: "Для статуса «Действует» укажите дату начала",
      });
    }
    if (!values.end_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Для статуса «Действует» укажите дату окончания",
      });
    }
  });

export type InstructionFormValues = z.infer<typeof instructionFormSchema>;

export const instructionFormDefaultValues: InstructionFormValues = {
  name: "",
  short_name: "",
  start_date: "",
  end_date: "",
  status: "active",
};
