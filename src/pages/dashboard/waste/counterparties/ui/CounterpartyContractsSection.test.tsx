import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useContractsListQuery } from "../../../../../entities/waste/contracts";
import { CounterpartyContractsSection } from "./CounterpartyContractsSection";

const { searchState, navigateMock } = vi.hoisted(() => ({
  searchState: {
    current: {} as {
      q?: string;
      status?: "active" | "inactive";
      contract_type?: "recycling" | "transport";
      waste_id?: string;
    },
  },
  navigateMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => searchState.current,
  useNavigate: () => navigateMock,
  Link: ({
    children,
    search,
  }: {
    children: ReactNode;
    search?: { counterparty_id?: string };
  }) => (
    <a href="/" data-counterparty={search?.counterparty_id}>
      {children}
    </a>
  ),
}));

vi.mock("../../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../../entities/waste/contracts", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../../entities/waste/contracts")
    >();
  return {
    ...actual,
    useContractsListQuery: vi.fn(),
    updateContract: vi.fn(),
    deleteContract: vi.fn(),
  };
});

vi.mock("../../contracts/ui/contracts-filters", () => ({
  ContractsFilters: () => <div>Фильтры договоров</div>,
}));

const useContractsListQueryMock = vi.mocked(useContractsListQuery);

function renderSection() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CounterpartyContractsSection counterpartyId="cp-1" />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

beforeEach(() => {
  searchState.current = {};
  navigateMock.mockReset();
  useContractsListQueryMock.mockReturnValue({
    items: [],
    total: 0,
    limit: 50,
    offset: 0,
    loading: false,
    error: null,
    fetching: false,
    refetch: vi.fn(),
    refreshing: false,
  });
});

describe("CounterpartyContractsSection", () => {
  it("запрашивает договоры только этого контрагента", () => {
    renderSection();

    expect(useContractsListQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-1",
        params: expect.objectContaining({ counterparty_id: "cp-1" }),
      }),
    );
    expect(screen.getByText("Фильтры договоров")).toBeInTheDocument();
    expect(screen.getByText("Договоров пока нет")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Создать договор" }),
    ).toHaveAttribute("data-counterparty", "cp-1");
  });

  it("при поиске показывает пустой результат фильтров", () => {
    searchState.current = { q: "Д-1" };
    renderSection();

    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
  });
});
