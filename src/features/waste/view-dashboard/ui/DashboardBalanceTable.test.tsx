import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardBalanceFixture } from "../../../../entities/waste/dashboards/model/dashboard.fixture";
import { DashboardBalanceTable } from "./DashboardBalanceTable";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

afterEach(cleanup);

describe("DashboardBalanceTable", () => {
  it("shows loading state", () => {
    render(
      <DashboardBalanceTable groups={[]} loading onSelect={vi.fn()} />,
    );
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("shows empty state with a link to operations", () => {
    render(<DashboardBalanceTable groups={[]} onSelect={vi.fn()} />);
    expect(
      screen.getByText("На выбранную дату остатков нет"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Открыть журнал операций" }),
    ).toHaveAttribute("href", "/waste/operations");
  });

  it("renders grouped snapshot rows and reports selection", () => {
    const onSelect = vi.fn();
    render(
      <DashboardBalanceTable
        groups={[dashboardBalanceFixture]}
        selectedUnitId="unit-1"
        selectedWasteId="waste-1"
        onSelect={onSelect}
      />,
    );

    expect(screen.getAllByText("Цех А (А)").length).toBeGreaterThan(0);
    expect(screen.getByText("Test waste")).toBeInTheDocument();
    expect(screen.getByText(/15\s*кг/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Zero waste"));
    expect(onSelect).toHaveBeenCalledWith({
      unit_id: "unit-1",
      waste_id: "waste-2",
    });
  });
});
