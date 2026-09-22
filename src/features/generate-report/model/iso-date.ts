import { z } from "zod";
import { isoDateZodSchema } from "../../../shared/lib/format-date";

export const isoDate = isoDateZodSchema();

export const optionalIsoDate = z.union([isoDate, z.literal("")]).optional();

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
