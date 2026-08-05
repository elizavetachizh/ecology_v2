import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TenantProvider } from "./TenantProvider";
import { useTenant } from "./tenant-context";

vi.mock("../../../entities/user", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 1,
    realm: "tenant-01",
    uuid: "user-id",
    username: "testuser",
    email: "test@example.com",
    roles: ["operator"],
    issuer: "https://auth.example.com/realms/tenant-01",
  }),
}));

vi.mock("../../../entities/tenant", () => ({
  getTenants: vi.fn().mockResolvedValue([
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
  ]),
}));

function Consumer() {
  const { user, flatTenants, activeTenantId, selectTenant } = useTenant();
  return (
    <div>
      <span>{user.username}</span>
      <span>{flatTenants.length}</span>
      <span>{activeTenantId ?? "none"}</span>
      <button onClick={() => void selectTenant("tenant-1")}>select</button>
    </div>
  );
}

describe("TenantProvider", () => {
  it("loads profile and tenants and switches active tenant", async () => {
    const onTenantChange = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <TenantProvider onTenantChange={onTenantChange}>
          <Consumer />
        </TenantProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("none")).toBeInTheDocument();

    fireEvent.click(screen.getByText("select"));
    await waitFor(() => expect(onTenantChange).toHaveBeenCalledOnce());
    expect(await screen.findByText("tenant-1")).toBeInTheDocument();
  });
});
