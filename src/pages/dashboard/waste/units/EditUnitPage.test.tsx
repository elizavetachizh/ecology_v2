import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getUnit, type UnitDetail } from "../../../../entities/waste/units";
import { EditUnitPage } from "./EditUnitPage";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  useNavigate: () => vi.fn(),
  useParams: () => ({ unitId: "unit-1" }),
  useSearch: () => ({}),
}));

vi.mock("../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../entities/waste/units", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/waste/units")>();
  return {
    ...actual,
    getUnit: vi.fn(),
  };
});

vi.mock("../../../../features/waste/upsert-unit", () => ({
  UnitForm: () => <div data-testid="unit-form" />,
}));

vi.mock("../../../../features/waste/bind-unit-instruction-waste", () => ({
  UnitInstructionWastesSection: () => <div data-testid="unit-wastes" />,
}));

const getUnitMock = vi.mocked(getUnit);

const profile = {
  id: "user-1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

function detail(isPod9: boolean): UnitDetail {
  return {
    id: "unit-1",
    tenant_id: "tenant-1",
    name: isPod9 ? "Журнал" : "Цех",
    short_name: null,
    parent_id: null,
    is_pod9: isPod9,
    region: null,
    district: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    created_by: profile,
    updated_by: profile,
    children: [],
  };
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <EditUnitPage />
    </QueryClientProvider>,
  );
}

describe("EditUnitPage", () => {
  afterEach(() => {
    cleanup();
    getUnitMock.mockReset();
  });

  it("shows waste bindings for a POD-9 unit", async () => {
    getUnitMock.mockResolvedValue(detail(true));
    renderPage();

    expect(await screen.findByTestId("unit-wastes")).toBeInTheDocument();
    expect(screen.queryByText(/Дочерние единицы/)).not.toBeInTheDocument();
  });

  it("shows direct children for a structural unit", async () => {
    getUnitMock.mockResolvedValue(detail(false));
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Дочерние единицы (0)" }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: "Журналы ПОД-9 (0)" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("unit-wastes")).not.toBeInTheDocument();
  });
});
