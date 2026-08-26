import z from "zod";

export const personFormSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  middle_name: z.string().optional(),
  uuid: z.string().optional(),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

export const createEmptyPersonFormValues: PersonFormValues = {
  name: "",
  first_name: "",
  last_name: "",
  middle_name: "",
  uuid: "",
};
