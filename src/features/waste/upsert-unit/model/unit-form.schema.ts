import { z } from "zod";

export const unitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите наименование")
    .max(255, "Не более 255 символов"),
  short_name: z
    .string()
    .trim()
    .min(1, "Укажите краткое наименование")
    .max(255, "Не более 255 символов"),
  parent_id: z.union([
    z.literal(""),
    z.string().uuid("Некорректный идентификатор родителя"),
  ]),
  region_id: z.number().optional(),
  district_id: z.number().optional(),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

export const unitFormDefaultValues: UnitFormValues = {
  name: "",
  short_name: "",
  parent_id: "",
  region_id: undefined,
  district_id: undefined,
};
