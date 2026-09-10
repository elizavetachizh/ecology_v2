import { z } from "zod";

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

export const optionalIsoDate = z.union([isoDate, z.literal("")]).optional();

export function yearStartIsoDate(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export function refinePeriodOrder(
  values: { start_date: string; end_date: string },
  ctx: z.RefinementCtx,
) {
  if (values.end_date < values.start_date) {
    ctx.addIssue({
      code: "custom",
      path: ["end_date"],
      message: "Дата окончания не может быть раньше даты начала",
    });
  }
}
