import { z } from "zod";
import {
  HazardClassValues,
  PhysicalStateValues,
  UomValues,
} from "../../../../entities/waste/wastes";

export const wasteFormSchema = z.object({
  waste_classifier_id: z
    .number({ error: "Выберите отход из классификатора" })
    .int()
    .positive("Выберите отход из классификатора"),
  hazard_class: z.enum(HazardClassValues),
  uom: z.enum(UomValues),
  physical_state: z.enum(PhysicalStateValues).nullable(),
});

export type WasteFormValues = z.infer<typeof wasteFormSchema>;

export const wasteFormDefaultValues: WasteFormValues = {
  waste_classifier_id: 0,
  hazard_class: "unclassified",
  uom: "kg",
  physical_state: "solid",
};
