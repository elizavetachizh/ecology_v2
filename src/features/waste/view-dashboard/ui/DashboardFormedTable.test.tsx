import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardFormedFixture } from "../../../../entities/waste/dashboards/model/dashboard.fixture";
import { DashboardFormedTable } from "./DashboardFormedTable";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

afterEach(cleanup);

describe("DashboardFormedTable", () => {
  it("shows loading state", () => {
    render(<DashboardFormedTable rows={[]} loading onSelect={vi.fn()} />);
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("shows empty state with a link to the operations journal", () => {
    render(<DashboardFormedTable rows={[]} onSelect={vi.fn()} />);
    expect(
      screen.getByText("За выбранный год образованных отходов нет"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Открыть журнал операций" }),
    ).toHaveAttribute("href", "/operations");
  });

  it("marks the selected row and reports click and keyboard selection", () => {
    const onSelect = vi.fn();
    render(
      <DashboardFormedTable
        rows={dashboardFormedFixture}
        selectedWasteId="waste-1"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText("Test waste")).toBeInTheDocument();
    expect(screen.getByRole("row", { selected: true })).toHaveTextContent(
      "Test waste",
    );

    fireEvent.click(screen.getByText("Zero waste"));
    const zeroRow = screen.getByText("Zero waste").closest("tr");
    fireEvent.keyDown(zeroRow!, { key: "Enter" });
    fireEvent.keyDown(zeroRow!, { key: " " });

    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onSelect).toHaveBeenCalledWith({ waste_id: "waste-2" });
  });
});
