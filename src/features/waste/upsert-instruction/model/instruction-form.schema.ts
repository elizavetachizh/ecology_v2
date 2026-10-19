import { z } from "zod";
import {
  addYearsIsoDate,
  isoDateZodSchema,
  todayIsoDate,
} from "../../../../shared/lib/format-date";

const optionalDate = isoDateZodSchema().or(z.literal(""));

export const INSTRUCTION_TERM_YEARS = 5;

export function instructionEndDateFromStart(startDate: string): string {
  return addYearsIsoDate(startDate, INSTRUCTION_TERM_YEARS);
}

/**
 * Keep end_date at start+5 years until the user sets a different end.
 * Returns null when the current end must be left as-is.
 */
export function nextSyncedInstructionEndDate(params: {
  previousStart: string;
  nextStart: string;
  currentEnd: string;
}): string | null {
  const { previousStart, nextStart, currentEnd } = params;
  if (!nextStart) return null;
  const stillLinked =
    currentEnd === "" ||
    currentEnd === instructionEndDateFromStart(previousStart);
  if (!stillLinked) return null;
  return instructionEndDateFromStart(nextStart);
}

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

const startDate = todayIsoDate();
const endDate = instructionEndDateFromStart(startDate);

export const instructionFormDefaultValues: InstructionFormValues = {
  name: "",
  short_name: "",
  start_date: startDate,
  end_date: endDate,
  status: "active",
};
