import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

export const pod10FormSchema = z
  .object({
    region_id: z.number("Выберите регион").int().positive(),
    district_id: z.number().int().positive().optional(),
    start_date: isoDate,
    end_date: isoDate,
    entry_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД")
      .optional()
      .or(z.literal("")),
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

export type Pod10FormValues = z.infer<typeof pod10FormSchema>;

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

export const pod10FormDefaultValues: Pod10FormValues = {
  region_id: null,
  district_id: undefined,
  start_date: yearStartIsoDate(),
  end_date: todayIsoDate(),
  entry_date: "",
};
