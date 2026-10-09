import { z } from "zod";
import { VehicleStatusValues } from "../../../../entities/waste/vehicles";

const requiredText = (emptyMessage: string) =>
  z.string().trim().min(1, emptyMessage).max(255, "Не более 255 символов");

const optionalPositiveInt = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (!/^\d+$/.test(value)) return false;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0;
  }, "Масса — целое число больше 0");

const optionalInt = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (!/^-?\d+$/.test(value)) return false;
    return Number.isSafeInteger(Number(value));
  }, "ID Белтопгаз — целое число");

export const vehicleFormSchema = z.object({
  make: requiredText("Укажите марку"),
  model: requiredText("Укажите модель"),
  license_plate: requiredText("Укажите госномер"),
  weight: optionalPositiveInt,
  status: z.enum(VehicleStatusValues),
  beltopgas_id: optionalInt,
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export const vehicleFormDefaultValues: VehicleFormValues = {
  make: "",
  model: "",
  license_plate: "",
  weight: "",
  status: "active",
  beltopgas_id: "",
};
