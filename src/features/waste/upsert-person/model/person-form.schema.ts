import z from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Не более ${max} символов`);

export const personFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите наименование")
    .max(255, "Не более 255 символов"),
  first_name: optionalText(255),
  last_name: optionalText(255),
  middle_name: optionalText(255),
  beltopgas_uuid: optionalText(50),
  unit_ids: z.array(z.string()),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

export const createEmptyPersonFormValues: PersonFormValues = {
  name: "",
  first_name: "",
  last_name: "",
  middle_name: "",
  beltopgas_uuid: "",
  unit_ids: [],
};
