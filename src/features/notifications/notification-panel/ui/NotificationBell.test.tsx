import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useNotificationSummaryQuery,
  useNotificationsListQuery,
  type NotificationSummary,
} from "../../../../entities/notifications";
import {
  TenantContext,
  type TenantContextValue,
} from "../../../../entities/tenant";
import { currentUser } from "../../../../entities/user";
import { NotificationBell } from "./NotificationBell";

vi.mock("../../../../entities/notifications", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/notifications")>();
  return {
    ...actual,
    useNotificationSummaryQuery: vi.fn(),
    useNotificationsListQuery: vi.fn(),
  };
});

const useNotificationSummaryQueryMock = vi.mocked(useNotificationSummaryQuery);
const useNotificationsListQueryMock = vi.mocked(useNotificationsListQuery);

const tenantValue: TenantContextValue = {
  user: currentUser(),
  tenants: [],
  flatTenants: [],
  activeTenantId: "tenant-1",
  activeTenant: null,
  selectTenant: vi.fn(),
};

function wrapper({ children }: { children: ReactNode }) {
  return (
    <TenantContext.Provider value={tenantValue}>
      {children}
    </TenantContext.Provider>
  );
}

function summaryResult(summary: NotificationSummary | null) {
  return {
    summary,
    loading: false,
    fetching: false,
    error: null,
    refetch: vi.fn(),
  };
}

afterEach(cleanup);

describe("NotificationBell", () => {
  beforeEach(() => {
    useNotificationSummaryQueryMock.mockReturnValue(
      summaryResult({ open: 2, warning: 1, critical: 1 }),
    );
    useNotificationsListQueryMock.mockReturnValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
      loading: false,
      fetching: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("paints the open count destructive when there is a critical episode", () => {
    render(<NotificationBell />, { wrapper });

    const button = screen.getByRole("button", { name: "Уведомления" });
    const badge = button.querySelector("[data-slot=badge]");
    expect(badge).toHaveTextContent("2");
    expect(badge).toHaveClass("text-destructive");
    expect(useNotificationsListQueryMock).not.toHaveBeenCalled();
  });

  it("paints the open count as a warning when nothing is critical", () => {
    useNotificationSummaryQueryMock.mockReturnValue(
      summaryResult({ open: 3, warning: 3, critical: 0 }),
    );
    render(<NotificationBell />, { wrapper });

    const badge = screen
      .getByRole("button", { name: "Уведомления" })
      .querySelector("[data-slot=badge]");
    expect(badge).toHaveTextContent("3");
    expect(badge).toHaveClass("text-warning-foreground");
  });

  it("hides the badge when nothing is open", () => {
    useNotificationSummaryQueryMock.mockReturnValue(
      summaryResult({ open: 0, warning: 0, critical: 0 }),
    );
    render(<NotificationBell />, { wrapper });

    expect(
      screen
        .getByRole("button", { name: "Уведомления" })
        .querySelector("[data-slot=badge]"),
    ).toBeNull();
  });

  it("loads the open list in the panel and keeps the header badge on open counts", () => {
    render(<NotificationBell />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Уведомления" }));

    expect(
      screen.getByRole("heading", { name: "Контроль остатков" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Открыто 2/)).toBeInTheDocument();
    expect(screen.getByText(/ниже 85% лимита/)).toBeInTheDocument();
    expect(useNotificationsListQueryMock).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      params: { status: "open", limit: 50, offset: 0 },
      enabled: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Погашенные" }));

    expect(useNotificationsListQueryMock).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      params: { status: "resolved", limit: 50, offset: 0 },
      enabled: true,
    });
    const badge = screen
      .getByRole("button", { name: "Уведомления" })
      .querySelector("[data-slot=badge]");
    expect(badge).toHaveTextContent("2");
    expect(badge).toHaveClass("text-destructive");
  });
});
