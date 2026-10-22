import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardFormedStatFixture } from "../../../../entities/waste/dashboards/model/dashboard.fixture";
import { ApiError } from "../../../../shared/api/api-client";
import { DashboardFormedCharts } from "./DashboardFormedCharts";

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

describe("DashboardFormedCharts", () => {
  it("asks to pick a row when nothing is selected", () => {
    render(<DashboardFormedCharts stat={null} selected={false} />);

    expect(screen.getByText("Нет выбранного отхода.")).toBeInTheDocument();
  });

  it("shows loading while stat is fetching", () => {
    render(<DashboardFormedCharts stat={null} loading selected />);
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("renders nothing when a selected row has no stat and is not loading", () => {
    const { container } = render(
      <DashboardFormedCharts stat={null} selected />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("labels the month series with the current and previous years", () => {
    render(
      <DashboardFormedCharts stat={dashboardFormedStatFixture} selected />,
    );

    expect(
      screen.getByRole("img", {
        name: "Образование отходов по подразделениям",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Образование отходов по месяцам" }),
    ).toBeInTheDocument();
    const legend = screen.getByRole("list", { name: "Годы на графике" });
    expect(legend).toHaveTextContent("2026");
    expect(legend).toHaveTextContent("2025");
  });

  it("draws charts when units are empty and months are zero", () => {
    render(
      <DashboardFormedCharts
        stat={{
          ...dashboardFormedStatFixture,
          units: [],
          months: dashboardFormedStatFixture.months.map((month) => ({
            ...month,
            current_amount: "0",
            previous_amount: "0",
          })),
        }}
        selected
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "Образование отходов по подразделениям",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Образование отходов по месяцам" }),
    ).toBeInTheDocument();
  });

  it("explains a 404 from the stat endpoint", () => {
    render(
      <DashboardFormedCharts
        stat={null}
        error={new ApiError("not found", 404, "http_error")}
        selected
      />,
    );

    expect(
      screen.getByText("Отход не найден в организации"),
    ).toBeInTheDocument();
  });
});
