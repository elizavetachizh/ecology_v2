import { z } from "zod";
import { isoDate, refinePeriodOrder } from "./iso-date";
import {
  todayIsoDate,
  yearStartIsoDate,
} from "../../../shared/lib/format-date";

export const pod9FormSchema = z
  .object({
    unit_id: z.uuid("Выберите место учёта").min(1, "Выберите место учёта"),
    instruction_id: z.uuid("Выберите инструкцию").min(1, "Выберите инструкцию"),
    start_date: isoDate,
    end_date: isoDate,
  })
  .superRefine(refinePeriodOrder);

export type Pod9FormValues = z.infer<typeof pod9FormSchema>;

export const pod9FormDefaultValues: Pod9FormValues = {
  unit_id: "",
  instruction_id: "",
  start_date: yearStartIsoDate(),
  end_date: todayIsoDate(),
};
