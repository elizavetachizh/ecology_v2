import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Unit } from "../../../../../../entities/waste/units";
import { UnitDirectChildren } from "./UnitDirectChildren";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    search,
  }: {
    children: ReactNode;
    search?: { parentId?: string; isPod9?: boolean };
  }) => (
    <a
      href="/"
      data-parent-id={search?.parentId}
      data-pod9={search?.isPod9 ? "true" : undefined}
    >
      {children}
    </a>
  ),
}));

const profile = {
  id: "user-1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

function unit(
  partial: Partial<Unit> & Pick<Unit, "id" | "name" | "is_pod9">,
): Unit {
  return {
    tenant_id: "tenant-1",
    short_name: null,
    parent_id: "parent-1",
    region: null,
    district: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    created_by: profile,
    updated_by: profile,
    ...partial,
  };
}

describe("UnitDirectChildren", () => {
  afterEach(cleanup);

  it("splits structural units and POD-9 journals", () => {
    render(
      <UnitDirectChildren
        parentId="parent-1"
        units={[
          unit({
            id: "struct-1",
            name: "Участок",
            short_name: "У",
            is_pod9: false,
            region: { id: 1, name: "Минская" },
            district: { id: 10, name: "Минский" },
          }),
          unit({
            id: "journal-1",
            name: "Журнал цеха",
            is_pod9: true,
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Дочерние единицы (1)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Журналы ПОД-9 (1)" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Участок" })).toBeInTheDocument();
    expect(screen.getByText("Минская")).toBeInTheDocument();
    expect(screen.getByText("Минский")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Журнал цеха" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Журнал цеха")).toBeInTheDocument();

    const createChild = screen.getByRole("link", { name: "Дочерняя единица" });
    expect(createChild).toHaveAttribute("data-parent-id", "parent-1");
    expect(createChild).not.toHaveAttribute("data-pod9");

    const createJournal = screen.getByRole("link", {
      name: "Создать журнал ПОД-9",
    });
    expect(createJournal).toHaveAttribute("data-pod9", "true");
  });

  it("keeps both sections when there are no children", () => {
    render(<UnitDirectChildren parentId="parent-1" units={[]} />);

    expect(
      screen.getByRole("heading", { name: "Дочерние единицы (0)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Журналы ПОД-9 (0)" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Нет дочерних единиц")).toBeInTheDocument();
    expect(
      screen.getByText("Журнал учёта отходов на этой единице ещё не создан."),
    ).toBeInTheDocument();
  });
});
