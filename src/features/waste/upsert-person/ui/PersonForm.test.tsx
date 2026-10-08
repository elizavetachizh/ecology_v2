import type { ComponentProps, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { personFixture } from "../../../../entities/waste/persons/model/person.fixture";
import type { UnitTree } from "../../../../entities/waste/units";
import { PersonForm } from "./PersonForm";

const { unitsState } = vi.hoisted(() => ({
  unitsState: {
    tree: [] as UnitTree[],
  },
}));

function unit(id: string, name: string, shortName: string | null): UnitTree {
  return {
    id,
    name,
    short_name: shortName,
    is_pod9: true,
    children: [],
  } as unknown as UnitTree;
}

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

vi.mock("../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../entities/waste/units", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/waste/units")>();
  return {
    ...actual,
    useUnitsTreeQuery: () => ({
      tree: unitsState.tree,
      loading: false,
      fetching: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

function renderForm(props: Partial<ComponentProps<typeof PersonForm>> = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PersonForm
        mode="create"
        onSaved={vi.fn()}
        onCancel={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  unitsState.tree = [];
});

describe("PersonForm", () => {
  it("shows name, FIO, Beltopgas and units on create", () => {
    renderForm();

    expect(screen.getByLabelText(/ФИО полностью/)).toBeInTheDocument();
    expect(screen.getByLabelText("Фамилия")).toBeInTheDocument();
    expect(screen.getByLabelText("Имя")).toBeInTheDocument();
    expect(screen.getByLabelText("Отчество")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "ПОД-9" })).toBeInTheDocument();
    expect(screen.queryByText("Пользователь")).not.toBeInTheDocument();
  });

  it("keeps the initial selected label when it is absent from the tree", () => {
    unitsState.tree = [unit("unit-2", "Склад", null)];

    renderForm({
      mode: "edit",
      personId: personFixture.id,
      initial: {
        ...personFixture,
        user_id: "user-2",
        user: {
          id: "user-2",
          username: "ivanov",
          email: null,
          first_name: "Иван",
          last_name: "Иванов",
          last_seen_at: null,
        },
        units: [{ id: "unit-1", name: "Цех", short_name: "Ц" }],
        unit_ids: ["unit-1", "unit-1"],
      },
    });

    expect(screen.getByText("Ц")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox", { name: "ПОД-9" }));

    expect(screen.getByRole("option", { name: "Склад" })).toBeInTheDocument();
  });

  it("does not duplicate a selected unit from the tree", () => {
    unitsState.tree = [
      unit("unit-1", "Цех", "Ц"),
      unit("unit-2", "Склад", null),
    ];

    renderForm({
      mode: "edit",
      initial: {
        ...personFixture,
        units: [{ id: "unit-1", name: "Цех", short_name: "Ц" }],
        unit_ids: ["unit-1"],
      },
    });

    fireEvent.click(screen.getByRole("combobox", { name: "ПОД-9" }));

    expect(screen.getAllByRole("option", { name: "Ц" })).toHaveLength(1);
  });
});
