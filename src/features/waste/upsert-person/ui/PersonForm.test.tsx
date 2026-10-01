import type { ComponentProps, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { personFixture } from "../../../../entities/waste/persons/model/person.fixture";
import type { UnitBrief } from "../../../../entities/waste/units";
import { PersonForm } from "./PersonForm";

const { unitsState } = vi.hoisted(() => ({
  unitsState: {
    options: [] as UnitBrief[],
  },
}));

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
    useUnitsOptions: () => ({
      options: unitsState.options,
      loading: false,
      refreshing: false,
      error: null,
      search: "",
      setSearch: vi.fn(),
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
  unitsState.options = [];
});

describe("PersonForm", () => {
  it("shows name, FIO, Beltopgas and units on create", () => {
    renderForm();

    expect(screen.getByLabelText(/ФИО полностью/)).toBeInTheDocument();
    expect(screen.getByLabelText("Фамилия")).toBeInTheDocument();
    expect(screen.getByLabelText("Имя")).toBeInTheDocument();
    expect(screen.getByLabelText("Отчество")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Подразделения" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Пользователь")).not.toBeInTheDocument();
  });

  it("keeps selected unit labels and shows the linked user as text", () => {
    unitsState.options = [{ id: "unit-2", name: "Склад", short_name: null }];

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

    expect(screen.getByText("ivanov")).toBeInTheDocument();
    expect(screen.getByText("Иванов Иван")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Пользователь" })).toBeNull();
    expect(screen.getByText("Ц")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox", { name: "Подразделения" }));

    expect(screen.getAllByRole("option", { name: "Ц" })).toHaveLength(1);
    expect(screen.getByRole("option", { name: "Склад" })).toBeInTheDocument();
  });

  it("does not duplicate a selected unit that search returns again", () => {
    unitsState.options = [
      { id: "unit-1", name: "Цех", short_name: "Ц" },
      { id: "unit-2", name: "Склад", short_name: null },
    ];

    renderForm({
      mode: "edit",
      initial: {
        ...personFixture,
        units: [{ id: "unit-1", name: "Цех", short_name: "Ц" }],
        unit_ids: ["unit-1"],
      },
    });

    fireEvent.click(screen.getByRole("combobox", { name: "Подразделения" }));

    expect(screen.getAllByRole("option", { name: "Ц" })).toHaveLength(1);
  });
});
