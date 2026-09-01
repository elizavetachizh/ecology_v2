import type { WasteBrief } from "./wastes.types";

export function wasteLabel(
  waste: Pick<WasteBrief, "waste_classifier">,
): string {
  return `${waste.waste_classifier.code} — ${waste.waste_classifier.name}`;
}
