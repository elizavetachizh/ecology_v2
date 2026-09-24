import { describe, expect, it } from "vitest";
import { getUnitFormHeaderCopy } from "./unit-form-header-copy";

describe("getUnitFormHeaderCopy", () => {
  it("на создании места учёта не называет его журналом", () => {
    expect(
      getUnitFormHeaderCopy({
        mode: "create",
        defaultIsPod9: true,
        isPod9: true,
      }),
    ).toEqual({
      title: "Новое место учёта",
      description:
        "Создание места учёта: родитель выбран. Укажите наименование и при необходимости поменяйте территорию.",
    });
  });

  it("на редактировании места учёта говорит про учёт по инструкции", () => {
    expect(
      getUnitFormHeaderCopy({
        mode: "edit",
        isPod9: true,
        unitName: "ОМТОМиВС ПОД",
      }),
    ).toEqual({
      title: "ОМТОМиВС ПОД",
      description: "На этом узле ведётся учёт отходов по инструкции.",
    });
  });

  it("для корневой единицы собирает территорию и состав", () => {
    expect(
      getUnitFormHeaderCopy({
        mode: "edit",
        isPod9: false,
        unitName: "ОМТОМиВС",
        parentId: null,
        regionName: "Минская область",
        districtName: "Минск г.",
        structuralCount: 1,
        accountingCount: 1,
      }).description,
    ).toBe(
      "Корневая единица. Минская область, Минск г. Одно подразделение и одно место учёта.",
    );
  });

  it("для вложенной единицы называет родителя", () => {
    expect(
      getUnitFormHeaderCopy({
        mode: "edit",
        isPod9: false,
        unitName: "Цех",
        parentId: "parent-1",
        parentName: "ОМТОМиВС",
        structuralCount: 2,
        accountingCount: 0,
      }).description,
    ).toBe("Входит в ОМТОМиВС. 2 подразделения, мест учёта нет.");
  });

  it("не называет единицу корневой, пока имя родителя ещё не загружено", () => {
    expect(
      getUnitFormHeaderCopy({
        mode: "edit",
        isPod9: false,
        unitName: "Цех",
        parentId: "parent-1",
        regionName: "Минская область",
      }).description,
    ).toBe("Минская область.");
  });

  it("склоняет состав", () => {
    expect(
      getUnitFormHeaderCopy({
        mode: "edit",
        isPod9: false,
        parentId: null,
        structuralCount: 5,
        accountingCount: 22,
      }).description,
    ).toBe("Корневая единица. 5 подразделений и 22 места учёта.");
  });
});
