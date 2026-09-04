import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardBurialPermitFixture } from "../../../../entities/waste/dashboards/model/dashboard.fixture";
import { DashboardBurialPermitTable } from "./DashboardBurialPermitTable";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

afterEach(cleanup);

describe("DashboardBurialPermitTable", () => {
  it("shows loading state", () => {
    render(
      <DashboardBurialPermitTable groups={[]} loading onSelect={vi.fn()} />,
    );
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("shows empty state with a link to permits", () => {
    render(<DashboardBurialPermitTable groups={[]} onSelect={vi.fn()} />);
    expect(
      screen.getByText("За выбранный год разрешений нет"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Открыть разрешения" }),
    ).toHaveAttribute("href", "/directories/permits");
  });

  it("renders grouped permit rows and reports selection", () => {
    const onSelect = vi.fn();
    render(
      <DashboardBurialPermitTable
        groups={[dashboardBurialPermitFixture]}
        selectedPermitId="permit-1"
        selectedWasteId="waste-1"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText("Р-001")).toBeInTheDocument();
    expect(screen.getByText("Test waste")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Zero waste"));
    expect(onSelect).toHaveBeenCalledWith({
      permit_id: "permit-1",
      waste_id: "waste-2",
    });
  });
});
