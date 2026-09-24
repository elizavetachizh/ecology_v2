type UnitFormHeaderCopyArgs = {
  mode: "create" | "edit";
  defaultIsPod9?: boolean;
  isPod9: boolean;
  unitName?: string | null;
  /** Пустой родитель на редактировании — корневая единица. */
  parentId?: string | null;
  /** Имя родителя, когда цепочка предков уже загружена. */
  parentName?: string | null;
  regionName?: string | null;
  districtName?: string | null;
  /** Прямые потомки без флага ПОД-9. Нет массива — состав в шапку не пишем. */
  structuralCount?: number;
  /** Прямые места учёта. Нет массива — состав в шапку не пишем. */
  accountingCount?: number;
};

export function getUnitFormHeaderCopy({
  mode,
  defaultIsPod9 = false,
  isPod9,
  unitName,
  parentId,
  parentName,
  regionName,
  districtName,
  structuralCount,
  accountingCount,
}: UnitFormHeaderCopyArgs): { title: string; description: string } {
  if (mode === "create") {
    if (defaultIsPod9) {
      return {
        title: "Новое место учёта",
        description:
          "Создание места учёта: родитель выбран. Укажите наименование и при необходимости поменяйте территорию.",
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
      title: unitName ?? "Место учёта",
      description: "На этом узле ведётся учёт отходов по инструкции.",
    };
  }

  return {
    title: unitName ?? "Структурная единица",
    description: editStructuralDescription({
      parentId,
      parentName,
      regionName,
      districtName,
      structuralCount,
      accountingCount,
    }),
  };
}

function editStructuralDescription({
  parentId,
  parentName,
  regionName,
  districtName,
  structuralCount,
  accountingCount,
}: Pick<
  UnitFormHeaderCopyArgs,
  | "parentId"
  | "parentName"
  | "regionName"
  | "districtName"
  | "structuralCount"
  | "accountingCount"
>): string {
  const sentences: string[] = [];

  if (!parentId) {
    sentences.push("Корневая единица");
  } else if (parentName) {
    sentences.push(`Входит в ${parentName}`);
  }

  const territory = [regionName, districtName].filter(Boolean).join(", ");
  if (territory) sentences.push(territory);

  if (structuralCount != null && accountingCount != null) {
    sentences.push(compositionSentence(structuralCount, accountingCount));
  }

  if (sentences.length === 0) {
    return "Структурная единица организации.";
  }

  return `${sentences.map((sentence) => sentence.replace(/\.$/, "")).join(". ")}.`;
}

function compositionSentence(structural: number, accounting: number): string {
  const units = countPhrase(
    structural,
    "подразделение",
    "подразделения",
    "подразделений",
  );
  const places = countPhrase(
    accounting,
    "место учёта",
    "места учёта",
    "мест учёта",
  );

  if (structural > 0 && accounting > 0) {
    return `${capitalize(units)} и ${places}`;
  }
  if (structural > 0) return `${capitalize(units)}, мест учёта нет`;
  if (accounting > 0) return `Подразделений нет, ${places}`;
  return "Подразделений и мест учёта нет";
}

function countPhrase(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  if (count === 1) return `одно ${one}`;
  return `${count} ${plural(count, one, few, many)}`;
}

function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
