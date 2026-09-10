import { z } from "zod";
import {
  isoDate,
  optionalIsoDate,
  refinePeriodOrder,
  yearStartIsoDate,
} from "./iso-date";
import { todayIsoDate } from "../../../shared/lib/format-date";

const optionalClassifierId = z.number().int().positive().optional().nullable();

export const pod10FormSchema = z
  .object({
    region_id: optionalClassifierId,
    district_id: optionalClassifierId,
    start_date: isoDate,
    end_date: isoDate,
    entry_date: optionalIsoDate,
  })
  .superRefine(refinePeriodOrder);

export type Pod10FormValues = z.infer<typeof pod10FormSchema>;

export const pod10FormDefaultValues: Pod10FormValues = {
  region_id: undefined,
  district_id: undefined,
  start_date: yearStartIsoDate(),
  end_date: todayIsoDate(),
  entry_date: "",
};
