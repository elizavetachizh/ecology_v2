import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

export const pod9FormSchema = z
  .object({
    unit_id: z
      .string()
      .min(1, "Выберите место учёта")
      .uuid("Выберите место учёта"),
    instruction_id: z
      .string()
      .min(1, "Выберите инструкцию")
      .uuid("Выберите инструкцию"),
    start_date: isoDate,
    end_date: isoDate,
  })
  .superRefine((values, ctx) => {
    if (values.end_date < values.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Дата окончания не может быть раньше даты начала",
      });
    }
  });

export type Pod9FormValues = z.infer<typeof pod9FormSchema>;

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function yearStartIsoDate(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export const pod9FormDefaultValues: Pod9FormValues = {
  unit_id: "",
  instruction_id: "",
  start_date: yearStartIsoDate(),
  end_date: todayIsoDate(),
};
