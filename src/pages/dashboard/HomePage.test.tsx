import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TenantContext,
  type Tenant,
  type TenantContextValue,
} from "../../entities/tenant";
import { currentUser } from "../../entities/user";
import { getDashboardBalance } from "../../entities/waste/dashboards";
import { getDashboardBalanceStat } from "../../entities/waste/dashboards";
import { getDashboardBurialPermits } from "../../entities/waste/dashboards";
import { getDashboardBurialPermitStat } from "../../entities/waste/dashboards";
import { getDashboardFormed } from "../../entities/waste/dashboards";
import { getDashboardFormedStat } from "../../entities/waste/dashboards";
import { getDashboardSummary } from "../../entities/waste/dashboards";
import {
  dashboardBalanceFixture,
  dashboardBalanceStatFixture,
  dashboardBurialPermitFixture,
  dashboardBurialPermitStatFixture,
  dashboardFormedFixture,
  dashboardFormedStatFixture,
  dashboardSummaryFixture,
} from "../../entities/waste/dashboards/model/dashboard.fixture";
import { HomePage } from "./HomePage";

const navigateMock = vi.hoisted(() => vi.fn());
const searchState = vi.hoisted(() => ({
  current: {
    on_date: "2026-08-15",
  } as {
    on_date?: string;
    burial_year?: number;
    formed_year?: number;
    summary_preset?:
      "this_day" | "this_week" | "this_month" | "this_year" | "custom";
    summary_from?: string;
    summary_to?: string;
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => searchState.current,
  useNavigate: () => navigateMock,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

vi.mock("../../entities/waste/dashboards/api/get-dashboard-balance", () => ({
  getDashboardBalance: vi.fn(),
}));

vi.mock(
  "../../entities/waste/dashboards/api/get-dashboard-balance-stat",
  () => ({
    getDashboardBalanceStat: vi.fn(),
  }),
);

vi.mock(
  "../../entities/waste/dashboards/api/get-dashboard-burial-permits",
  () => ({
    getDashboardBurialPermits: vi.fn(),
  }),
);

vi.mock(
  "../../entities/waste/dashboards/api/get-dashboard-burial-permit-stat",
  () => ({
    getDashboardBurialPermitStat: vi.fn(),
  }),
);

vi.mock("../../entities/waste/dashboards/api/get-dashboard-formed", () => ({
  getDashboardFormed: vi.fn(),
}));

vi.mock(
  "../../entities/waste/dashboards/api/get-dashboard-formed-stat",
  () => ({
    getDashboardFormedStat: vi.fn(),
  }),
);

vi.mock("../../entities/waste/dashboards/api/get-dashboard-summary", () => ({
  getDashboardSummary: vi.fn(),
}));

const getDashboardBalanceMock = vi.mocked(getDashboardBalance);
const getDashboardBalanceStatMock = vi.mocked(getDashboardBalanceStat);
const getDashboardBurialPermitsMock = vi.mocked(getDashboardBurialPermits);
const getDashboardBurialPermitStatMock = vi.mocked(
  getDashboardBurialPermitStat,
);
const getDashboardFormedMock = vi.mocked(getDashboardFormed);
const getDashboardFormedStatMock = vi.mocked(getDashboardFormedStat);
const getDashboardSummaryMock = vi.mocked(getDashboardSummary);

const user = currentUser({ email: null });

const tenant: Tenant = {
  id: "tenant-1",
  realm: "mingas",
  name: "Головная",
  short: "Головная",
  parent_id: null,
  children: [],
};

const tenantValue: TenantContextValue = {
  user,
  tenants: [tenant],
  flatTenants: [tenant],
  activeTenantId: "tenant-1",
  activeTenant: tenant,
  selectTenant: vi.fn(),
};

const noTenantValue: TenantContextValue = {
  ...tenantValue,
  activeTenantId: null,
  activeTenant: null,
};

function counterValue(label: string): string | null {
  return (
    screen.getByText(label).parentElement?.querySelector(".text-2xl")
      ?.textContent ?? null
  );
}

function renderPage(value: TenantContextValue = tenantValue) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <TenantContext.Provider value={value}>
        <HomePage />
      </TenantContext.Provider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("HomePage", () => {
  beforeEach(() => {
    searchState.current = { on_date: "2026-08-15" };
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 23, 12, 0, 0));
    navigateMock.mockReset();
    getDashboardBalanceMock.mockReset();
    getDashboardBalanceStatMock.mockReset();
    getDashboardBalanceMock.mockResolvedValue([dashboardBalanceFixture]);
    getDashboardBalanceStatMock.mockResolvedValue(dashboardBalanceStatFixture);
    getDashboardBurialPermitsMock.mockReset();
    getDashboardBurialPermitStatMock.mockReset();
    getDashboardBurialPermitsMock.mockResolvedValue([
      dashboardBurialPermitFixture,
    ]);
    getDashboardBurialPermitStatMock.mockResolvedValue(
      dashboardBurialPermitStatFixture,
    );
    getDashboardFormedMock.mockReset();
    getDashboardFormedStatMock.mockReset();
    getDashboardFormedMock.mockResolvedValue(dashboardFormedFixture);
    getDashboardFormedStatMock.mockResolvedValue(dashboardFormedStatFixture);
    getDashboardSummaryMock.mockReset();
    getDashboardSummaryMock.mockImplementation(async (params) => ({
      ...dashboardSummaryFixture,
      period: {
        ...dashboardSummaryFixture.period,
        date_from: params.date_from,
        date_to: params.date_to,
      },
    }));
  });

  it("asks to pick an organization when tenant is missing", () => {
    renderPage(noTenantValue);
    expect(screen.getByText("Выберите организацию")).toBeInTheDocument();
    expect(getDashboardBalanceMock).not.toHaveBeenCalled();
    expect(getDashboardBurialPermitsMock).not.toHaveBeenCalled();
    expect(getDashboardFormedMock).not.toHaveBeenCalled();
    expect(getDashboardFormedStatMock).not.toHaveBeenCalled();
    expect(getDashboardSummaryMock).not.toHaveBeenCalled();
  });

  it("loads the as-of snapshot and the first series", async () => {
    renderPage();

    expect(await screen.findByText("Остатки отходов")).toBeInTheDocument();
    expect((await screen.findAllByText("Test waste")).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Динамика остатка")).toBeInTheDocument();

    await waitFor(() => {
      expect(getDashboardBalanceMock).toHaveBeenCalledWith(
        { on_date: "2026-08-15" },
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(getDashboardBalanceStatMock).toHaveBeenCalledWith(
        {
          on_date: "2026-08-15",
          unit_id: "unit-1",
          waste_id: "waste-1",
          months: 6,
        },
        expect.any(AbortSignal),
      );
    });
    expect(await screen.findByText("Захоронение")).toBeInTheDocument();
    await waitFor(() => {
      expect(getDashboardBurialPermitsMock).toHaveBeenCalledWith(
        { year: 2026 },
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(getDashboardBurialPermitStatMock).toHaveBeenCalledWith(
        {
          year: 2026,
          permit_id: "permit-1",
          waste_id: "waste-1",
        },
        expect.any(AbortSignal),
      );
    });
    expect(await screen.findByText("Образование отходов")).toBeInTheDocument();
    await waitFor(() => {
      expect(getDashboardFormedMock).toHaveBeenCalledWith(
        { year: 2026 },
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(getDashboardFormedStatMock).toHaveBeenCalledWith(
        {
          year: 2026,
          waste_id: "waste-1",
        },
        expect.any(AbortSignal),
      );
    });
  });

  it("writes the clicked waste to search params", async () => {
    renderPage();
    const zeroRows = await screen.findAllByText("Zero waste");
    fireEvent.click(zeroRows[0]!);

    expect(navigateMock).toHaveBeenCalled();
    const updater = navigateMock.mock.calls[0]![0].search as (prev: {
      on_date?: string;
    }) => unknown;
    expect(updater({ on_date: "2026-08-15" })).toEqual({
      on_date: "2026-08-15",
      unit_id: "unit-1",
      waste_id: "waste-2",
    });
  });

  it("writes the clicked burial waste to search params", async () => {
    renderPage();
    const zeroRows = await screen.findAllByText("Zero waste");
    fireEvent.click(zeroRows[1]!);

    expect(navigateMock).toHaveBeenCalled();
    const updater = navigateMock.mock.calls[0]![0].search as (prev: {
      on_date?: string;
    }) => unknown;
    expect(updater({ on_date: "2026-08-15" })).toEqual({
      on_date: "2026-08-15",
      permit_id: "permit-1",
      permit_waste_id: "waste-2",
    });
  });

  it("writes the clicked formed waste to search params", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText("Zero waste")).toHaveLength(3);
    });
    fireEvent.click(screen.getAllByText("Zero waste")[2]!);

    expect(navigateMock).toHaveBeenCalled();
    const updater = navigateMock.mock.calls[0]![0].search as (prev: {
      on_date?: string;
    }) => unknown;
    expect(updater({ on_date: "2026-08-15" })).toEqual({
      on_date: "2026-08-15",
      formed_waste_id: "waste-2",
    });
  });

  it("loads this month's summary above the balances and shows the response window", async () => {
    renderPage();

    const headings = await screen.findAllByRole("heading", { level: 1 });
    expect(headings[0]).toHaveTextContent("Сводка");
    expect(headings.map((heading) => heading.textContent)).toContain(
      "Остатки отходов",
    );

    await waitFor(() => {
      expect(getDashboardSummaryMock).toHaveBeenCalledWith(
        { date_from: "2026-10-01", date_to: "2026-10-31" },
        expect.any(AbortSignal),
      );
    });

    expect(
      await screen.findByText("01.10.2026 — 31.10.2026"),
    ).toBeInTheDocument();
    expect(counterValue("Подтверждённые операции")).toBe("40");
    expect(counterValue("Паспорта")).toBe("12");
    expect(counterValue("ТТН")).toBe("7");
    expect(
      screen.getByText("Подтверждённые операции").parentElement,
    ).toHaveTextContent("5 на подтверждении");
    expect(screen.getByText("Паспорта").parentElement).toHaveTextContent(
      "6 без вывоза",
    );
    expect(screen.getByText("ТТН").parentElement).toHaveTextContent(
      "3 без вывоза",
    );
    expect(screen.getByText("Цех №1")).toBeInTheDocument();
    expect(screen.getByText("Цех №2")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Образовано" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Вывезено" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Цех №2").closest("tr")).toHaveTextContent("0");
  });

  it("writes a named summary preset and clears custom dates", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("radio", { name: "Сегодня" }));

    expect(navigateMock).toHaveBeenCalled();
    const updater = navigateMock.mock.calls[0]![0].search as (prev: {
      on_date?: string;
      summary_from?: string;
    }) => unknown;
    expect(
      updater({ on_date: "2026-08-15", summary_from: "2026-01-01" }),
    ).toEqual({
      on_date: "2026-08-15",
      summary_from: undefined,
      summary_preset: "this_day",
      summary_to: undefined,
    });
  });

  it("seeds custom dates from the current month preset", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("radio", { name: "Период" }));

    const updater = navigateMock.mock.calls[0]![0].search as (prev: {
      on_date?: string;
    }) => unknown;
    expect(updater({ on_date: "2026-08-15" })).toEqual({
      on_date: "2026-08-15",
      summary_preset: "custom",
      summary_from: "2026-10-01",
      summary_to: "2026-10-31",
    });
  });

  it("requests the custom window stored in the url", async () => {
    searchState.current = {
      on_date: "2026-08-15",
      summary_preset: "custom",
      summary_from: "2026-10-19",
      summary_to: "2026-10-25",
    };
    renderPage();

    await waitFor(() => {
      expect(getDashboardSummaryMock).toHaveBeenCalledWith(
        { date_from: "2026-10-19", date_to: "2026-10-25" },
        expect.any(AbortSignal),
      );
    });
    expect(
      await screen.findByText("19.10.2026 — 25.10.2026"),
    ).toBeInTheDocument();
  });

  it("does not request summary when the custom window is reversed", async () => {
    searchState.current = {
      on_date: "2026-08-15",
      summary_preset: "custom",
      summary_from: "2026-10-31",
      summary_to: "2026-10-01",
    };
    renderPage();

    expect(
      await screen.findByText("Дата начала позже даты окончания"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Подтверждённые операции"),
    ).not.toBeInTheDocument();
    expect(getDashboardSummaryMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getDashboardBalanceMock).toHaveBeenCalled();
    });
  });

  it("keeps burial and formed on the calendar year when the balance date is another year", async () => {
    searchState.current = { on_date: "2025-08-15" };
    renderPage();

    await waitFor(() => {
      expect(getDashboardBalanceMock).toHaveBeenCalledWith(
        { on_date: "2025-08-15" },
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(getDashboardBurialPermitsMock).toHaveBeenCalledWith(
        { year: 2026 },
        expect.any(AbortSignal),
      );
      expect(getDashboardBurialPermitStatMock).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2026 }),
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(getDashboardFormedMock).toHaveBeenCalledWith(
        { year: 2026 },
        expect.any(AbortSignal),
      );
      expect(getDashboardFormedStatMock).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2026 }),
        expect.any(AbortSignal),
      );
    });
    expect(screen.getByLabelText("Год разрешений")).toHaveValue(2026);
    expect(screen.getByLabelText("Год образования")).toHaveValue(2026);
  });

  it("requests burial and formed years from the url independently", async () => {
    searchState.current = {
      on_date: "2025-08-15",
      burial_year: 2024,
      formed_year: 2023,
    };
    renderPage();

    await waitFor(() => {
      expect(getDashboardBurialPermitsMock).toHaveBeenCalledWith(
        { year: 2024 },
        expect.any(AbortSignal),
      );
      expect(getDashboardBurialPermitStatMock).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2024 }),
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(getDashboardFormedMock).toHaveBeenCalledWith(
        { year: 2023 },
        expect.any(AbortSignal),
      );
      expect(getDashboardFormedStatMock).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2023 }),
        expect.any(AbortSignal),
      );
    });
    expect(getDashboardBalanceMock).toHaveBeenCalledWith(
      { on_date: "2025-08-15" },
      expect.any(AbortSignal),
    );
    expect(screen.getByLabelText("Год разрешений")).toHaveValue(2024);
    expect(screen.getByLabelText("Год образования")).toHaveValue(2023);
  });

  it("writes only the burial year when the burial filter changes", async () => {
    renderPage();
    fireEvent.change(await screen.findByLabelText("Год разрешений"), {
      target: { value: "2025" },
    });

    expect(navigateMock).toHaveBeenCalled();
    const updater = navigateMock.mock.calls.at(-1)![0].search as (prev: {
      on_date?: string;
      formed_year?: number;
    }) => unknown;
    expect(updater({ on_date: "2026-08-15", formed_year: 2024 })).toEqual({
      on_date: "2026-08-15",
      formed_year: 2024,
      burial_year: 2025,
    });
  });

  it("writes only the formed year when the formed filter changes", async () => {
    renderPage();
    fireEvent.change(await screen.findByLabelText("Год образования"), {
      target: { value: "2024" },
    });

    expect(navigateMock).toHaveBeenCalled();
    const updater = navigateMock.mock.calls.at(-1)![0].search as (prev: {
      on_date?: string;
      burial_year?: number;
    }) => unknown;
    expect(updater({ on_date: "2026-08-15", burial_year: 2025 })).toEqual({
      on_date: "2026-08-15",
      burial_year: 2025,
      formed_year: 2024,
    });
  });

  it("highlights a burial fact above the permit-term limit", async () => {
    const waste = dashboardBurialPermitFixture.wastes[0]!;
    getDashboardBurialPermitsMock.mockResolvedValue([
      {
        ...dashboardBurialPermitFixture,
        wastes: [{ ...waste, amount: "150.000000", limit: "100.000000" }],
      },
    ]);
    getDashboardBurialPermitStatMock.mockResolvedValue({
      ...dashboardBurialPermitStatFixture,
      limit: "10.000000",
    });
    renderPage();

    await waitFor(() => {
      expect(
        screen.getAllByTitle("Факт за год выше лимита разрешения"),
      ).toHaveLength(2);
    });
    const highlighted = screen.getAllByTitle(
      "Факт за год выше лимита разрешения",
    );
    expect(highlighted.map((node) => node.textContent)).toEqual([
      "150 кг",
      "12",
    ]);
    for (const node of highlighted) {
      expect(node).toHaveClass("text-destructive");
    }
    expect(screen.getAllByText("на срок разрешения, не на год")).toHaveLength(
      2,
    );
  });

  it("shows an error when the snapshot request fails", async () => {
    getDashboardBalanceMock.mockRejectedValue(new Error("boom"));
    renderPage();

    expect(
      await screen.findByText("Не удалось загрузить остатки"),
    ).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});
