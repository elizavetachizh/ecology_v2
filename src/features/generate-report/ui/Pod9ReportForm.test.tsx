import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TenantContext,
  type Tenant,
  type TenantContextValue,
} from "../../../entities/tenant";
import type { CurrentUser } from "../../../entities/user";
import { Pod9ReportForm } from "./Pod9ReportForm";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...rest }: { children: ReactNode }) => (
    <a {...rest}>{children}</a>
  ),
}));

vi.mock("../../../entities/waste/units", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../entities/waste/units")>();
  return {
    ...actual,
    useUnitsTreeQuery: () => ({
      tree: [],
      loading: false,
      error: null,
    }),
  };
});

vi.mock(
  "../../../entities/waste/unit-instruction-waste",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../entities/waste/unit-instruction-waste")
      >();
    return {
      ...actual,
      useUnitInstructionsListQuery: () => ({
        items: [],
        loading: false,
        error: null,
      }),
      useUnitInstructionWastesListQuery: () => ({
        items: [],
        total: 0,
        loading: false,
        error: null,
      }),
    };
  },
);

const fetchMock = vi.fn();

vi.mock("../api/fetchPod9Report", () => ({
  fetchPod9Report: (...args: unknown[]) => fetchMock(...args),
}));

const user: CurrentUser = {
  id: 1,
  realm: "mingas",
  uuid: "user-id",
  username: "testuser",
  email: null,
  roles: ["operator"],
  issuer: "https://auth.example.com/realms/mingas",
};

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

function renderForm() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <TenantContext.Provider value={tenantValue}>
        <Pod9ReportForm />
      </TenantContext.Provider>
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("Pod9ReportForm", () => {
  it("renders params, PDF hint, and download actions", () => {
    renderForm();

    expect(screen.getByRole("heading", { name: "ПОД-9" })).toBeInTheDocument();
    expect(screen.getByText("Место учёта")).toBeInTheDocument();
    expect(screen.getByText("Инструкция")).toBeInTheDocument();
    expect(screen.getByLabelText(/Начало периода/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Конец периода/)).toBeInTheDocument();
    expect(
      screen.getByText("Предпросмотр — PDF; для работы в Excel скачайте xlsx."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Предпросмотр" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Скачать Excel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Скачать PDF" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("321")).not.toBeInTheDocument();
  });

  it("validates required params before calling the reports API", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Предпросмотр" }));

    await waitFor(() => {
      expect(screen.getByText("Выберите место учёта")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Скачать PDF" }));
    await waitFor(() => {
      expect(screen.getByText("Выберите место учёта")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
