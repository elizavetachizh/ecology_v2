import { describe, expect, it } from "vitest";
import { routes } from "../config/routes";
import { directoryBreadcrumbItems } from "./directory-breadcrumb-items";

describe("directoryBreadcrumbItems", () => {
  it("on a list page keeps the directory as the current crumb", () => {
    expect(
      directoryBreadcrumbItems({
        directoryLabel: "Нормативы",
        directoryTo: routes.directories.standards.list,
      }),
    ).toEqual([
      { label: "Справочники", to: routes.directories.index },
      { label: "Нормативы", to: undefined },
    ]);
  });

  it("on a form page links back to the directory list", () => {
    expect(
      directoryBreadcrumbItems({
        directoryLabel: "Нормативы",
        directoryTo: routes.directories.standards.list,
        current: "Новый норматив",
      }),
    ).toEqual([
      { label: "Справочники", to: routes.directories.index },
      { label: "Нормативы", to: routes.directories.standards.list },
      { label: "Новый норматив" },
    ]);
  });

  it("keeps extra hierarchy crumbs between the directory and the current page", () => {
    const extra = [
      {
        label: "Цех №1",
        to: routes.directories.units.detail,
        params: { unitId: "u1" },
      },
    ];
    expect(
      directoryBreadcrumbItems({
        directoryLabel: "Структура организации",
        directoryTo: routes.directories.units.list,
        extra,
        current: "Новая единица",
      }),
    ).toEqual([
      { label: "Справочники", to: routes.directories.index },
      {
        label: "Структура организации",
        to: routes.directories.units.list,
      },
      ...extra,
      { label: "Новая единица" },
    ]);
  });
});
