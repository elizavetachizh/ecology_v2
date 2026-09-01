import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  makeOperation,
  operationFixture,
} from "../../../../entities/waste/operations/model/operation.fixture";
import { OperationCard } from "./OperationCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...rest }: { children: ReactNode }) => (
    <a {...rest}>{children}</a>
  ),
}));

vi.mock("../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../entities/waste/waste-sources", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/waste-sources")
    >();
  return {
    ...actual,
    useWasteSourcesOptions: () => ({
      options: [{ id: "ws-1", name: "Цех №3" }],
      loading: false,
      refreshing: false,
      error: null,
      search: "",
      setSearch: vi.fn(),
      refetch: vi.fn(),
    }),
  };
});

vi.mock("../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    useCurrentBalanceQuery: () => ({
      balance: { unit_id: "unit-1", waste_id: "waste-1", amount: "10.000000" },
      loading: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

function renderCard(operation = operationFixture) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <OperationCard
        operation={operation}
        onCancel={vi.fn()}
        onDeleted={vi.fn()}
        onSaved={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("OperationCard", () => {
  it("lets a confirmed formed operation edit date, amount and source", () => {
    renderCard();

    expect(
      screen.getByRole("heading", { name: "Образовано · 01.03.2026" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Дата операции/)).toHaveValue("2026-03-01");
    expect(screen.getByLabelText(/Количество/)).toHaveValue(10);
    expect(
      screen.getByRole("combobox", { name: "Источник образования" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Цех №3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Сохранить" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Сохранить и закрыть" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Удалить" })).toBeInTheDocument();
    expect(screen.queryByText(/Шаг \d/)).not.toBeInTheDocument();
  });

  it("hides editors and delete for a declined operation", () => {
    renderCard(makeOperation({ status: "declined", balance: null }));

    expect(screen.queryByLabelText(/Дата операции/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Сохранить" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Удалить" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
  });

  it("does not show waste source editor for a used operation", () => {
    renderCard(
      makeOperation({
        operation_type: "used",
        waste_source_id: null,
        waste_source: null,
        use_purpose: "energy",
      }),
    );

    expect(screen.getByLabelText(/Дата операции/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Количество/)).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Источник образования" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Цель использования")).toBeInTheDocument();
  });

  it("shows review actions when confirmation is required", () => {
    renderCard(
      makeOperation({
        status: "confirmation_required",
        balance: null,
      }),
    );

    expect(
      screen.getByRole("button", { name: "Подтвердить" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Отклонить" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Сохранить" }),
    ).toBeInTheDocument();
  });
});
