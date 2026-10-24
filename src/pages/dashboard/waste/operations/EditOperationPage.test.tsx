import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TenantContext,
  type Tenant,
  type TenantContextValue,
} from "../../../../entities/tenant";
import { currentUser } from "../../../../entities/user";
import { getPeriodLock } from "../../../../entities/waste/operations/api/get-period-lock";
import { getOperation } from "../../../../entities/waste/operations";
import { makeOperation } from "../../../../entities/waste/operations/model/operation.fixture";
import { EditOperationPage } from "./EditOperationPage";

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ operationId: "op-1" }),
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

vi.mock("../../../../entities/waste/operations/api/get-period-lock", () => ({
  getPeriodLock: vi.fn(),
}));

vi.mock("../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    getOperation: vi.fn(),
  };
});

const getOperationMock = vi.mocked(getOperation);
const getPeriodLockMock = vi.mocked(getPeriodLock);

const openPeriodLock = {
  lock_date: null,
  created_at: null,
  updated_at: null,
  created_by: null,
  updated_by: null,
};

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

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <TenantContext.Provider value={tenantValue}>
        <EditOperationPage />
      </TenantContext.Provider>
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("EditOperationPage", () => {
  beforeEach(() => {
    getOperationMock.mockReset();
    getPeriodLockMock.mockReset();
    getPeriodLockMock.mockResolvedValue(openPeriodLock);
  });

  it("shows not-found when the operation is missing", async () => {
    getOperationMock.mockRejectedValue(new Error("not found"));
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Операция не найдена.")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: "К журналу операций" }),
    ).toBeInTheDocument();
  });

  it("renders a locked operation as read-only", async () => {
    getOperationMock.mockResolvedValue(
      makeOperation({ date: "2026-01-31", status: "confirmation_required" }),
    );
    getPeriodLockMock.mockResolvedValue({
      ...openPeriodLock,
      lock_date: "2026-01-31",
    });
    renderPage();

    expect(
      await screen.findByText(
        "Закрыт по 31.01.2026. Операции с этой датой и раньше нельзя создавать и изменять.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Сохранить" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Подтвердить" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Отклонить" }),
    ).not.toBeInTheDocument();
  });
});
