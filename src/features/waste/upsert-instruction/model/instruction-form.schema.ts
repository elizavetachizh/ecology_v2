import { z } from "zod";

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД")
  .or(z.literal(""));

function refineDateRange(
  values: { start_date: string; end_date: string },
  ctx: z.RefinementCtx,
) {
  const start = values.start_date;
  const end = values.end_date;
  if (start && end && end < start) {
    ctx.addIssue({
      code: "custom",
      path: ["end_date"],
      message: "Дата окончания не может быть раньше даты начала",
    });
  }
}

const instructionFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите наименование")
    .max(255, "Не более 255 символов"),
  short_name: z.string().max(255, "Не более 255 символов"),
  start_date: optionalDate,
  end_date: optionalDate,
});

/** Сохранение черновика: даты необязательны. */
export const instructionFormSchema = instructionFieldsSchema.superRefine(
  refineDateRange,
);

/** Ввод в действие: обе даты обязательны. */
export const instructionActivateSchema = instructionFieldsSchema
  .superRefine(refineDateRange)
  .superRefine((values, ctx) => {
    if (!values.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["start_date"],
        message: "Чтобы ввести в действие, укажите дату начала",
      });
    }
    if (!values.end_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Чтобы ввести в действие, укажите дату окончания",
      });
    }
  });

export type InstructionFormValues = z.infer<typeof instructionFormSchema>;

export const instructionFormDefaultValues: InstructionFormValues = {
  name: "",
  short_name: "",
  start_date: "",
  end_date: "",
};
