type UnitFormHeaderCopyArgs = {
  mode: "create" | "edit";
  defaultIsPod9?: boolean;
  isPod9: boolean;
  unitName?: string | null;
};

export function getUnitFormHeaderCopy({
  mode,
  defaultIsPod9 = false,
  isPod9,
  unitName,
}: UnitFormHeaderCopyArgs): { title: string; description: string } {
  if (mode === "create") {
    if (defaultIsPod9) {
      return {
        title: "Новая единица ПОД-9",
        description:
          "Создание журнала ПОД-9: родитель выбран, флаг ПОД-9 включён. Укажите наименование и при необходимости территорию.",
      };
    }
    return {
      title: "Новая структурная единица",
      description:
        "Создание структурной единицы: укажите наименование, родителя и при необходимости территорию.",
    };
  }

  if (isPod9) {
    return {
      title: unitName ?? "Структурная единица",
      description:
        "Редактирование журнала ПОД-9: флаг ПОД-9 включён. Укажите наименование и при необходимости территорию.",
    };
  }

  return {
    title: unitName ?? "Структурная единица",
    description:
      "Редактирование структурной единицы: укажите наименование и при необходимости территорию.",
  };
}
