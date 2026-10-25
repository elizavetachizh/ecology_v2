import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PeriodLock } from "../../../../entities/waste/operations";
import { userProfileFixture } from "../../../../entities/waste/persons";
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
  open?: boolean;
}) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <PeriodLockBanner open={false} onOpenChange={() => {}} {...props} />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("PeriodLockBanner", () => {
  it("renders no closed-period alert when the period is open", () => {
    renderBanner({ periodLock: openLock });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Операционный период закрыт/),
    ).not.toBeInTheDocument();
  });

  it("does not warn in the banner when the period is closed", () => {
    renderBanner({ periodLock: closedLock });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Операционный период закрыт/),
    ).not.toBeInTheDocument();
  });

  it("hides the dialog while the lock request is loading", () => {
    renderBanner({ periodLock: null, loading: true, open: true });

    expect(
      screen.getByText("Загрузка операционного периода…"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a load error without the dialog", () => {
    renderBanner({
      periodLock: null,
      error: new Error("Сервер вернул ошибку 500"),
      open: true,
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Не удалось загрузить операционный период",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Сервер вернул ошибку 500",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the settings dialog", () => {
    renderBanner({ periodLock: closedLock, open: true });

    expect(
      screen.getByRole("dialog", { name: "Операционный период" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Последний закрытый день/)).toHaveValue(
      "2026-01-31",
    );
  });
});
