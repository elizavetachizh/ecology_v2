import { z } from "zod";

export const wasteSourceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите наименование источника")
    .max(255, "Не более 255 символов"),
});

export type WasteSourceFormValues = z.infer<typeof wasteSourceFormSchema>;

export const wasteSourceFormDefaultValues: WasteSourceFormValues = {
  name: "",
};
