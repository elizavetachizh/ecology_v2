import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVehiclesListQuery } from "../../../../entities/waste/vehicles";
import { vehicleFixture } from "../../../../entities/waste/vehicles/model/vehicle.fixture";
import { VehiclesPage } from "./VehiclesPage";

const { searchState, tenantState, navigateMock } = vi.hoisted(() => ({
  searchState: {
    current: {} as {
      q?: string;
      status?: "active" | "inactive";
      sort?: string;
      order?: "asc" | "desc";
      offset?: number;
    },
  },
  tenantState: { activeTenantId: "tenant-1" as string | null },
  navigateMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => searchState.current,
  useNavigate: () => navigateMock,
  Link: ({ children, to }: { children: ReactNode; to?: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

vi.mock("../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: tenantState.activeTenantId }),
}));

vi.mock("../../../../entities/waste/vehicles", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/waste/vehicles")>();
  return {
    ...actual,
    useVehiclesListQuery: vi.fn(),
    deleteVehicle: vi.fn(),
  };
});

const useVehiclesListQueryMock = vi.mocked(useVehiclesListQuery);

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <VehiclesPage />
    </QueryClientProvider>,
  );
}

function mockList(
  items: unknown[] = [],
  extra?: { error?: Error | null; total?: number },
) {
  useVehiclesListQueryMock.mockReturnValue({
    items: items as never,
    total: extra?.total ?? items.length,
    limit: 50,
    offset: 0,
    loading: false,
    error: extra?.error ?? null,
    fetching: false,
    refetch: vi.fn(),
  });
}

afterEach(cleanup);

beforeEach(() => {
  searchState.current = {};
  tenantState.activeTenantId = "tenant-1";
  navigateMock.mockReset();
  mockList();
});

describe("VehiclesPage", () => {
  it("asks to add a vehicle when the list is empty", () => {
    renderPage();

    expect(screen.getByText("Транспортных средств пока нет")).toBeInTheDocument();
    expect(
      screen.getByText("Добавьте первое транспортное средство в справочник."),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("По марке, модели или госномеру"),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Все" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Активные" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Неактивные" })).toBeInTheDocument();
  });

  it("shows the load error instead of the table", () => {
    mockList([], { error: new Error("сеть") });
    renderPage();

    expect(
      screen.getByText("Не удалось загрузить транспортные средства"),
    ).toBeInTheDocument();
    expect(screen.getByText("сеть")).toBeInTheDocument();
    expect(
      screen.queryByText("Транспортных средств пока нет"),
    ).not.toBeInTheDocument();
  });

  it("asks to choose an organization when there is no tenant", () => {
    tenantState.activeTenantId = null;
    renderPage();

    expect(screen.getByText("Выберите организацию")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Чтобы работать со справочником транспортных средств, выберите организацию в верхней панели.",
      ),
    ).toBeInTheDocument();
  });

  it("renders vehicle fields and a dash for empty weight and beltopgas id", () => {
    mockList([
      vehicleFixture,
      {
        ...vehicleFixture,
        id: "vehicle-2",
        make: "КАМАЗ",
        model: "65115",
        license_plate: "7777 КМ-7",
        weight: null,
        beltopgas_id: null,
        status: "inactive",
      },
    ]);
    renderPage();

    expect(screen.getByRole("link", { name: "МАЗ" })).toBeInTheDocument();
    expect(screen.getByText("5551")).toBeInTheDocument();
    expect(screen.getByText("1234 AB-7")).toBeInTheDocument();
    expect(screen.getByText("12000")).toBeInTheDocument();
    expect(screen.getByText("1001")).toBeInTheDocument();
    expect(screen.getByText("Активное")).toBeInTheDocument();
    expect(screen.getByText("Неактивное")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("asks to confirm a hard delete", () => {
    mockList([vehicleFixture]);
    renderPage();

    const trigger = screen.getByRole("button", { name: "Действия со строкой" });
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Удалить транспортное средство" }),
    );

    expect(
      screen.getByRole("heading", { name: "Удалить транспортное средство?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Транспортное средство «МАЗ 5551» (1234 AB-7) будет удалено. Это действие нельзя отменить.",
      ),
    ).toBeInTheDocument();
  });

  it("loads the list with make ascending by default", () => {
    renderPage();

    expect(useVehiclesListQueryMock).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      params: {
        search: undefined,
        status: undefined,
        sort: "make",
        order: "asc",
        limit: 50,
        offset: 0,
      },
    });
  });

  it("resets offset when the status tab changes", () => {
    searchState.current = { q: "маз", offset: 50 };
    renderPage();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Активные" }), {
      button: 0,
    });

    const updater = navigateMock.mock.calls[0]?.[0]?.search as
      | ((prev: typeof searchState.current) => typeof searchState.current)
      | undefined;
    expect(updater?.({ q: "маз", offset: 50 })).toEqual({
      q: "маз",
      offset: 0,
      status: "active",
    });
  });
});
