import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  retainSearchParams,
  RouterProvider,
} from "@tanstack/react-router";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTenants, useTenant } from "../../../entities/tenant";
import { getCurrentUser } from "../../../entities/user";
import { currentUser } from "../../../entities/user";
import {
  clearAllActiveTenantIds,
  readActiveTenantId,
  writeActiveTenantId,
} from "../../../shared/auth/active-tenant-storage";
import { clearSessionState } from "../../../shared/auth/cleanup-session";
import { parseRootSearch } from "../../router/search-params";
import { TenantProvider } from "./TenantProvider";

vi.mock("../../../entities/user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("../../../entities/tenant", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../entities/tenant")>();
  return {
    ...actual,
    getTenants: vi.fn(),
  };
});

const getCurrentUserMock = vi.mocked(getCurrentUser);
const getTenantsMock = vi.mocked(getTenants);

const user = currentUser({
  realm: "tenant-01",
  issuer: "https://auth.example.com/realms/tenant-01",
});

const twoTenants = [
  {
    id: "tenant-1",
    realm: "tenant-01",
    name: "Tenant 1",
    short: "T1",
    parent_id: null,
    children: [],
  },
  {
    id: "tenant-2",
    realm: "tenant-01",
    name: "Tenant 2",
    short: "T2",
    parent_id: null,
    children: [],
  },
];

function Consumer() {
  const { user, flatTenants, activeTenantId, selectTenant } = useTenant();
  return (
    <div>
      <span>{user.username}</span>
      <span>{flatTenants.length}</span>
      <span data-testid="active-tenant">{activeTenantId ?? "none"}</span>
      <button type="button" onClick={() => void selectTenant("tenant-1")}>
        select-1
      </button>
      <button type="button" onClick={() => void selectTenant("tenant-2")}>
        select-2
      </button>
    </div>
  );
}

async function renderProvider(initialUrl = "/") {
  const rootRoute = createRootRoute({
    validateSearch: parseRootSearch,
    search: {
      middlewares: [retainSearchParams(["tenant"])],
    },
    component: () => (
      <TenantProvider>
        <Consumer />
      </TenantProvider>
    ),
  });
  const history = createMemoryHistory({ initialEntries: [initialUrl] });
  const router = createRouter({ routeTree: rootRoute, history });
  await router.load();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  };
}

describe("TenantProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    getCurrentUserMock.mockReset();
    getTenantsMock.mockReset();
    getCurrentUserMock.mockResolvedValue(user);
    getTenantsMock.mockResolvedValue(twoTenants);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("loads profile and tenants and switches active tenant in URL and storage", async () => {
    const { router } = await renderProvider();

    expect(await screen.findByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByTestId("active-tenant")).toHaveTextContent("none");

    fireEvent.click(screen.getByText("select-1"));
    await waitFor(() => {
      expect(screen.getByTestId("active-tenant")).toHaveTextContent("tenant-1");
    });
    expect(readActiveTenantId("tenant-01")).toBe("tenant-1");
    await waitFor(() => {
      expect(router.state.location.search.tenant).toBe("tenant-1");
    });
  });

  it("keeps active tenant null when storage is empty and there are 2+ tenants", async () => {
    await renderProvider();

    expect(await screen.findByTestId("active-tenant")).toHaveTextContent(
      "none",
    );
    expect(readActiveTenantId("tenant-01")).toBeNull();
  });

  it("prefers tenant from URL over stored last-used", async () => {
    writeActiveTenantId("tenant-01", "tenant-2");
    await renderProvider("/?tenant=tenant-1");

    expect(await screen.findByTestId("active-tenant")).toHaveTextContent(
      "tenant-1",
    );
    await waitFor(() => {
      expect(readActiveTenantId("tenant-01")).toBe("tenant-1");
    });
  });

  it("restores valid tenant id from localStorage and writes it to the URL", async () => {
    writeActiveTenantId("tenant-01", "tenant-2");
    const { router } = await renderProvider("/");

    expect(await screen.findByTestId("active-tenant")).toHaveTextContent(
      "tenant-2",
    );
    await waitFor(() => {
      expect(router.state.location.search.tenant).toBe("tenant-2");
    });
  });

  it("clears stale stored id and stays without active tenant", async () => {
    writeActiveTenantId("tenant-01", "tenant-missing");
    await renderProvider();

    expect(await screen.findByTestId("active-tenant")).toHaveTextContent(
      "none",
    );
    await waitFor(() => {
      expect(readActiveTenantId("tenant-01")).toBeNull();
    });
  });

  it("auto-selects the only tenant and persists it to storage and URL", async () => {
    getTenantsMock.mockResolvedValue([twoTenants[0]!]);
    const { router } = await renderProvider();

    expect(await screen.findByTestId("active-tenant")).toHaveTextContent(
      "tenant-1",
    );
    await waitFor(() => {
      expect(readActiveTenantId("tenant-01")).toBe("tenant-1");
      expect(router.state.location.search.tenant).toBe("tenant-1");
    });
  });

  it("stays without an active tenant when the filtered list is empty", async () => {
    getTenantsMock.mockResolvedValue([]);
    await renderProvider();

    expect(await screen.findByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByTestId("active-tenant")).toHaveTextContent("none");
  });

  it("clearSessionState removes persisted tenant ids", async () => {
    writeActiveTenantId("tenant-01", "tenant-1");
    writeActiveTenantId("other-realm", "tenant-x");

    await clearSessionState();

    expect(readActiveTenantId("tenant-01")).toBeNull();
    expect(readActiveTenantId("other-realm")).toBeNull();
    clearAllActiveTenantIds();
  });
});
