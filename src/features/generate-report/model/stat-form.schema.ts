import { z } from "zod";
import {
  STAT_REPORT_YEAR_MAX,
  STAT_REPORT_YEAR_MIN,
} from "../../../entities/reports";

export const statFormSchema = z.object({
  year: z
    .number({ error: "Укажите отчётный год" })
    .int("Укажите отчётный год")
    .min(
      STAT_REPORT_YEAR_MIN,
      `Год от ${STAT_REPORT_YEAR_MIN} до ${STAT_REPORT_YEAR_MAX}`,
    )
    .max(
      STAT_REPORT_YEAR_MAX,
      `Год от ${STAT_REPORT_YEAR_MIN} до ${STAT_REPORT_YEAR_MAX}`,
    ),
});

export type StatFormValues = z.infer<typeof statFormSchema>;

export const statFormDefaultValues: StatFormValues = {
  year: new Date().getFullYear(),
};
