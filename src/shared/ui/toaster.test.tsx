import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dismiss, toast } from "./toast-store";
import { Toaster } from "./toaster";

const ids: string[] = [];

afterEach(() => {
  ids.splice(0).forEach(dismiss);
  cleanup();
  vi.useRealTimers();
});

describe("Toaster", () => {
  it("shows a success toast and dismisses it from the close button", () => {
    render(<Toaster />);

    act(() => {
      ids.push(toast.success("Сохранено"));
    });

    expect(screen.getByText("Сохранено")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(screen.queryByText("Сохранено")).not.toBeInTheDocument();
  });

  it("auto-dismisses after the timeout", () => {
    vi.useFakeTimers();
    render(<Toaster />);

    act(() => {
      ids.push(toast.error("Не удалось сохранить"));
    });
    expect(screen.getByText("Не удалось сохранить")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText("Не удалось сохранить")).not.toBeInTheDocument();
  });
});
