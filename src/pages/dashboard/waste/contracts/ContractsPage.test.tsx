import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useContractsListQuery } from "../../../../entities/waste/contracts";
import { ContractsPage } from "./ContractsPage";

const { searchState, listState } = vi.hoisted(() => ({
  searchState: {
    current: {} as {
      q?: string;
      status?: "active" | "inactive";
      contract_type?: "recycling" | "transport";
      counterparty_id?: string;
      waste_id?: string;
    },
  },
  listState: {
    items: [] as unknown[],
    total: 0,
    limit: 50,
    offset: 0,
    loading: false,
    error: null as Error | null,
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => searchState.current,
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: ReactNode; to?: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

vi.mock("../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../entities/waste/contracts", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/contracts")
    >();
  return {
    ...actual,
    useContractsListQuery: vi.fn(),
    updateContract: vi.fn(),
    deleteContract: vi.fn(),
  };
});

vi.mock("./ui/contracts-filters", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./ui/contracts-filters")>();
  return {
    ...actual,
    ContractsFilters: () => null,
  };
});

const useContractsListQueryMock = vi.mocked(useContractsListQuery);

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <ContractsPage />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

beforeEach(() => {
  searchState.current = {};
  listState.items = [];
  listState.total = 0;
  listState.loading = false;
  listState.error = null;
  useContractsListQueryMock.mockReturnValue({
    items: listState.items as never,
    total: listState.total,
    limit: listState.limit,
    offset: listState.offset,
    loading: listState.loading,
    error: listState.error,
    fetching: false,
    refetch: vi.fn(),
    refreshing: false,
  });
});

describe("ContractsPage", () => {
  it("asks to create a contract when the list is empty without filters", () => {
    renderPage();

    expect(screen.getByText("Договоров пока нет")).toBeInTheDocument();
    expect(
      screen.getByText("Создайте свой первый договор."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ничего не найдено")).not.toBeInTheDocument();
  });

  it("asks to change filters when the list is empty with a search", () => {
    searchState.current = { q: "Д-1" };
    renderPage();

    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
    expect(
      screen.getByText("Измените фильтры или сбросьте поиск."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Договоров пока нет")).not.toBeInTheDocument();
  });

  it("shows the load error instead of the table", () => {
    useContractsListQueryMock.mockReturnValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
      loading: false,
      error: new Error("сеть"),
      fetching: false,
      refetch: vi.fn(),
      refreshing: false,
    });
    renderPage();

    expect(
      screen.getByText("Не удалось загрузить договоры"),
    ).toBeInTheDocument();
    expect(screen.getByText("сеть")).toBeInTheDocument();
    expect(screen.queryByText("Договоров пока нет")).not.toBeInTheDocument();
  });
});
