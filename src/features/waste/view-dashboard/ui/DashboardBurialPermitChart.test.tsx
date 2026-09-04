import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardBurialPermitStatFixture } from "../../../../entities/waste/dashboards/model/dashboard.fixture";
import { ApiError } from "../../../../shared/api/api-client";
import { DashboardBurialPermitChart } from "./DashboardBurialPermitChart";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
      <div data-testid="chart-container">{children}</div>
    ),
  };
});

afterEach(cleanup);

describe("DashboardBurialPermitChart", () => {
  it("asks to pick a row when nothing is selected", () => {
    render(<DashboardBurialPermitChart stat={null} selected={false} />);

    expect(
      screen.getByText("Нет выбранной пары разрешение / отход."),
    ).toBeInTheDocument();
  });

  it("shows loading while stat is fetching", () => {
    render(<DashboardBurialPermitChart stat={null} loading selected />);
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("renders the monthly series and year total vs limit", () => {
    render(
      <DashboardBurialPermitChart
        stat={dashboardBurialPermitStatFixture}
        selected
      />,
    );

    expect(
      screen.getByText(/Р-001 · Цех А \(А\) · 1010100 — Test waste/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Вывоз на захоронение по месяцам" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/12 \/ 100/)).toBeInTheDocument();
  });

  it("explains a 404 from the stat endpoint", () => {
    render(
      <DashboardBurialPermitChart
        stat={null}
        error={new ApiError("not found", 404, "http_error")}
        selected
      />,
    );

    expect(
      screen.getByText("Разрешение или отход не найдены в организации."),
    ).toBeInTheDocument();
  });
});
