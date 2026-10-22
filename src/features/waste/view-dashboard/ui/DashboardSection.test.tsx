import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DashboardSection } from "./DashboardSection";

afterEach(cleanup);

describe("DashboardSection", () => {
  it("shows the error title and message", () => {
    render(
      <DashboardSection
        error={new Error("boom")}
        errorTitle="Не удалось загрузить остатки"
        title="Остатки отходов"
        description="Снимок на выбранную дату."
        table={<p>table</p>}
        chart={<p>chart</p>}
      />,
    );

    expect(
      screen.getByText("Не удалось загрузить остатки"),
    ).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
    expect(screen.queryByText("Остатки отходов")).not.toBeInTheDocument();
    expect(screen.queryByText("table")).not.toBeInTheDocument();
  });

  it("renders the header, table, and sticky chart", () => {
    render(
      <DashboardSection
        error={null}
        errorTitle="Не удалось загрузить остатки"
        title="Остатки отходов"
        description="Снимок на выбранную дату."
        actions={<button type="button">фильтр</button>}
        table={<p>table</p>}
        chart={<p>chart</p>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Остатки отходов" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Снимок на выбранную дату.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "фильтр" })).toBeInTheDocument();
    expect(screen.getByText("table")).toBeInTheDocument();
    expect(screen.getByText("chart").parentElement).toHaveClass(
      "xl:sticky",
      "xl:top-4",
    );
  });
});
