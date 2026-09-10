import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pod10ReportForm } from "./Pod10ReportForm";

vi.mock("../../waste/select-region-classifier", () => ({
  RegionClassifierSelect: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (item: { id: number; name: string } | null) => void;
  }) => (
    <button type="button" onClick={() => onChange({ id: 1, name: "Минск" })}>
      {value ? `region ${value}` : "Регион не выбран"}
    </button>
  ),
}));

vi.mock("../../waste/select-district-classifier", () => ({
  DistrictClassifierSelect: () => <div>Район</div>,
}));

const fetchMock = vi.fn();

vi.mock("../../../entities/reports", () => ({
  fetchPod10Report: (...args: unknown[]) => fetchMock(...args),
}));

afterEach(cleanup);

describe("Pod10ReportForm", () => {
  it("renders optional geo, period, entry date and generate action", () => {
    render(<Pod10ReportForm />);

    expect(screen.getByRole("heading", { name: "ПОД-10" })).toBeInTheDocument();
    expect(screen.getByText("Регион")).toBeInTheDocument();
    expect(screen.getByText("Район")).toBeInTheDocument();
    expect(screen.getByLabelText(/Начало периода/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Конец периода/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Дата внесения/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Сформировать" }),
    ).toBeInTheDocument();
  });

  it("allows generating without region", async () => {
    fetchMock.mockResolvedValue({
      blob: new Blob(["%PDF"], { type: "application/pdf" }),
      contentType: "application/pdf",
      fileName: "pod-10.pdf",
    });

    render(<Pod10ReportForm />);
    fireEvent.click(screen.getByRole("button", { name: "Сформировать" }));

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
