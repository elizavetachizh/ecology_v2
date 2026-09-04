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
import { getOperation } from "../../../../entities/waste/operations";
import { EditOperationPage } from "./EditOperationPage";

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ operationId: "op-1" }),
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
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
});
