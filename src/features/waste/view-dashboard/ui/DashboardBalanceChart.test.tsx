import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardBalanceStatFixture } from "../../../../entities/waste/dashboards/model/dashboard.fixture";
import { ApiError } from "../../../../shared/api/api-client";
import { DashboardBalanceChart } from "./DashboardBalanceChart";

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

describe("DashboardBalanceChart", () => {
  it("asks to pick a row when nothing is selected", () => {
    render(
      <DashboardBalanceChart
        stat={null}
        months={6}
        onMonthsChange={vi.fn()}
        selected={false}
      />,
    );

    expect(
      screen.getByText("Нет выбранной пары подразделение / отход."),
    ).toBeInTheDocument();
  });

  it("shows loading while stat is fetching", () => {
    render(
      <DashboardBalanceChart
        stat={null}
        loading
        months={6}
        onMonthsChange={vi.fn()}
        selected
      />,
    );

    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("renders the series and reports months change", () => {
    const onMonthsChange = vi.fn();
    render(
      <DashboardBalanceChart
        stat={dashboardBalanceStatFixture}
        months={6}
        onMonthsChange={onMonthsChange}
        selected
      />,
    );

    expect(
      screen.getByText(/Цех А \(А\) · 1010100 — Test waste/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Динамика остатка по месяцам" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Число точек графика"), {
      target: { value: "12" },
    });
    expect(onMonthsChange).toHaveBeenCalledWith(12);
  });

  it("explains a 404 from the stat endpoint", () => {
    render(
      <DashboardBalanceChart
        stat={null}
        error={new ApiError("not found", 404, "http_error")}
        months={6}
        onMonthsChange={vi.fn()}
        selected
      />,
    );

    expect(
      screen.getByText("Подразделение или отход не найдены в организации."),
    ).toBeInTheDocument();
  });
});
