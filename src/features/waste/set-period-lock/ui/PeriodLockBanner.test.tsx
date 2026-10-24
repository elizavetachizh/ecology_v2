import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PeriodLock } from "../../../../entities/waste/operations";
import { userProfileFixture } from "../../../../entities/waste/persons";
import { formatDateTime } from "../../../../shared/lib/format-date";
import { PeriodLockBanner } from "./PeriodLockBanner";

vi.mock("../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    updatePeriodLock: vi.fn(),
  };
});

const openLock: PeriodLock = {
  lock_date: null,
  created_at: null,
  updated_at: null,
  created_by: null,
  updated_by: null,
};

const closedLock: PeriodLock = {
  lock_date: "2026-01-31",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
};

function renderBanner(props: {
  periodLock: PeriodLock | null;
  loading?: boolean;
  error?: Error | null;
}) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <PeriodLockBanner {...props} />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("PeriodLockBanner", () => {
  it("shows an open period and the settings button", () => {
    renderBanner({ periodLock: openLock });

    expect(screen.getByText("Период открыт")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Настроить" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("warns when the period is closed and shows the audit line", () => {
    renderBanner({ periodLock: closedLock });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Закрыт по 31.01.2026. Операции с этой датой и раньше нельзя создавать и изменять.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      `Изменил tester, ${formatDateTime(closedLock.updated_at)}`,
    );
  });

  it("omits the audit line when the lock has no editor", () => {
    renderBanner({
      periodLock: { ...closedLock, updated_by: null, updated_at: null },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Закрыт по 31.01.2026");
    expect(screen.getByRole("alert")).not.toHaveTextContent("Изменил");
  });

  it("hides settings while the lock request is loading and does not offer save", () => {
    renderBanner({ periodLock: null, loading: true });

    expect(
      screen.getByText("Загрузка операционного периода…"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Настроить" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Сохранить" }),
    ).not.toBeInTheDocument();
  });

  it("shows a load error without the settings button", () => {
    renderBanner({
      periodLock: null,
      error: new Error("Сервер вернул ошибку 500"),
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Не удалось загрузить операционный период",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Сервер вернул ошибку 500",
    );
    expect(
      screen.queryByRole("button", { name: "Настроить" }),
    ).not.toBeInTheDocument();
  });

  it("opens the settings dialog", () => {
    renderBanner({ periodLock: closedLock });

    fireEvent.click(screen.getByRole("button", { name: "Настроить" }));

    expect(
      screen.getByRole("dialog", { name: "Операционный период" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Последний закрытый день/)).toHaveValue(
      "2026-01-31",
    );
    expect(
      screen.getByText("Сдвиг даты назад снова открывает хвост."),
    ).toBeInTheDocument();
  });
});
