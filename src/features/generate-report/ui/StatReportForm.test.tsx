import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatReportForm } from "./StatReportForm";

const fetchMock = vi.fn();

vi.mock("../../../entities/reports", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../entities/reports")>();
  return {
    ...actual,
    fetchStatReport: (...args: unknown[]) => fetchMock(...args),
  };
});

afterEach(cleanup);

describe("StatReportForm", () => {
  it("renders year and generate action", () => {
    render(<StatReportForm />);

    expect(
      screen.getByRole("heading", { name: "1-отходы" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Отчётный год/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Сформировать" }),
    ).toBeInTheDocument();
  });

  it("does not call the API when the year is out of range", async () => {
    render(<StatReportForm />);

    fireEvent.change(screen.getByLabelText(/Отчётный год/), {
      target: { value: "1899" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Сформировать" }));

    await waitFor(() => {
      expect(screen.getByText(/Год от 1900 до 2100/)).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("generates the report for the selected year", async () => {
    fetchMock.mockResolvedValue({
      blob: new Blob(["%PDF"], { type: "application/pdf" }),
      contentType: "application/pdf",
      fileName: "stat_2026.pdf",
    });

    render(<StatReportForm />);
    fireEvent.change(screen.getByLabelText(/Отчётный год/), {
      target: { value: "2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Сформировать" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2026, format: "pdf" }),
      expect.any(AbortSignal),
    );
  });
});
