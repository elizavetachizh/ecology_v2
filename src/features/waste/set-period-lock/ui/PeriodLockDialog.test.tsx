import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  updatePeriodLock,
  type PeriodLock,
} from "../../../../entities/waste/operations";
import { userProfileFixture } from "../../../../entities/waste/persons";
import { toast } from "../../../../shared/ui";
import { PeriodLockDialog } from "./PeriodLockDialog";

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

const updatePeriodLockMock = vi.mocked(updatePeriodLock);

const closedLock: PeriodLock = {
  lock_date: "2026-01-31",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
};

const openLock: PeriodLock = {
  ...closedLock,
  lock_date: null,
};

function renderDialog(
  periodLock: PeriodLock | null,
  onOpenChange = vi.fn(),
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  render(
    <QueryClientProvider client={client}>
      <PeriodLockDialog
        open
        periodLock={periodLock}
        onOpenChange={onOpenChange}
      />
    </QueryClientProvider>,
  );
  return onOpenChange;
}

describe("PeriodLockDialog", () => {
  beforeEach(() => {
    updatePeriodLockMock.mockReset();
    updatePeriodLockMock.mockImplementation(async (body) => ({
      ...closedLock,
      lock_date: body.lock_date,
    }));
    vi.spyOn(toast, "success").mockReturnValue(
      "00000000-0000-0000-0000-000000000000",
    );
    vi.spyOn(toast, "error").mockReturnValue(
      "00000000-0000-0000-0000-000000000000",
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not send an empty date", async () => {
    renderDialog(openLock);

    expect(
      screen.queryByRole("button", { name: "Открыть период" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(
      await screen.findByText("Укажите последний закрытый день"),
    ).toBeInTheDocument();
    expect(updatePeriodLockMock).not.toHaveBeenCalled();
  });

  it("saves the chosen lock date and closes", async () => {
    const onOpenChange = renderDialog(openLock);

    fireEvent.change(screen.getByLabelText(/Последний закрытый день/), {
      target: { value: "2026-03-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() =>
      expect(updatePeriodLockMock).toHaveBeenCalledWith({
        lock_date: "2026-03-15",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("Период закрыт по 15.03.2026");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("asks before clearing the lock and sends null", async () => {
    updatePeriodLockMock.mockResolvedValue(openLock);
    const onOpenChange = renderDialog(closedLock);

    fireEvent.click(screen.getByRole("button", { name: "Открыть период" }));
    const confirm = screen.getByRole("dialog", { name: "Открыть период?" });
    fireEvent.click(
      within(confirm).getByRole("button", { name: "Открыть период" }),
    );

    await waitFor(() =>
      expect(updatePeriodLockMock).toHaveBeenCalledWith({ lock_date: null }),
    );
    expect(toast.success).toHaveBeenCalledWith("Период открыт");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps the dialog open and toasts when save fails", async () => {
    updatePeriodLockMock.mockRejectedValue(
      new Error("Сервер вернул ошибку 400"),
    );
    const onOpenChange = renderDialog(closedLock);

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Сервер вернул ошибку 400"),
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "Операционный период" }),
    ).toBeInTheDocument();
  });

  it("does not dismiss while the request is pending", async () => {
    updatePeriodLockMock.mockImplementation(() => new Promise(() => {}));
    const onOpenChange = renderDialog(closedLock);

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Сохранение…" })).toBeDisabled(),
    );
    expect(
      screen.queryByRole("button", { name: "Закрыть" }),
    ).not.toBeInTheDocument();

    fireEvent.keyDown(
      screen.getByRole("dialog", { name: "Операционный период" }),
      { key: "Escape", code: "Escape" },
    );

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
