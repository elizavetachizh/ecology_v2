import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationsListQuery } from "../../../../entities/notifications";
import { makeNotification } from "../../../../entities/notifications/model/notification.fixture";
import { NotificationList } from "./NotificationList";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("../../../../entities/notifications", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/notifications")>();
  return {
    ...actual,
    useNotificationsListQuery: vi.fn(),
  };
});

const useNotificationsListQueryMock = vi.mocked(useNotificationsListQuery);

function listResult(
  overrides: Partial<ReturnType<typeof useNotificationsListQuery>> = {},
) {
  return {
    items: [],
    total: 0,
    limit: 50,
    offset: 0,
    loading: false,
    fetching: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

afterEach(cleanup);

describe("NotificationList", () => {
  beforeEach(() => {
    useNotificationsListQueryMock.mockReturnValue(listResult());
  });

  it("asks for the open list only while the panel is open", () => {
    render(
      <NotificationList tenantId="tenant-1" status="open" enabled={false} />,
    );

    expect(useNotificationsListQueryMock).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      params: { status: "open", limit: 50, offset: 0 },
      enabled: false,
    });
  });

  it("shows a loading state", () => {
    useNotificationsListQueryMock.mockReturnValue(
      listResult({ loading: true }),
    );
    render(<NotificationList tenantId="tenant-1" status="open" enabled />);
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("shows an error with a retry", () => {
    const refetch = vi.fn();
    useNotificationsListQueryMock.mockReturnValue(
      listResult({ error: new Error("fail"), refetch }),
    );
    render(<NotificationList tenantId="tenant-1" status="open" enabled />);

    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows an empty open list and an empty history", () => {
    const { rerender } = render(
      <NotificationList tenantId="tenant-1" status="open" enabled />,
    );
    expect(screen.getByText("Нет открытых условий")).toBeInTheDocument();

    rerender(
      <NotificationList tenantId="tenant-1" status="resolved" enabled />,
    );
    expect(screen.getByText("Нет погашенных")).toBeInTheDocument();
  });

  it("sorts critical before warning and notes a truncated page", () => {
    const warning = makeNotification({
      id: "warning",
      severity: "warning",
      title: "Почти лимит",
    });
    const critical = makeNotification({
      id: "critical",
      severity: "critical",
      title: "Сверх лимита",
    });
    useNotificationsListQueryMock.mockReturnValue(
      listResult({
        items: [warning, critical],
        total: 80,
      }),
    );

    render(<NotificationList tenantId="tenant-1" status="open" enabled />);

    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles.map((node) => node.textContent)).toEqual([
      "Сверх лимита",
      "Почти лимит",
    ]);
    expect(screen.getByText("Показаны 2 из 80")).toBeInTheDocument();
  });

  it("asks to pick an organization when there is no tenant", () => {
    render(<NotificationList tenantId={null} status="open" enabled />);
    expect(
      screen.getByText("Выберите организацию в верхней панели."),
    ).toBeInTheDocument();
    expect(useNotificationsListQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: null, enabled: true }),
    );
  });
});
