import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageContextBar } from "./page-context-bar";

afterEach(cleanup);

describe("PageContextBar", () => {
  it("renders title, description and actions", () => {
    render(
      <PageContextBar
        title="Отходы"
        description="Справочник отходов"
        actions={<button type="button">Создать</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Отходы" })).toBeInTheDocument();
    expect(screen.getByText("Справочник отходов")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Создать" }),
    ).toBeInTheDocument();
  });

  it("renders a string eyebrow as muted text", () => {
    render(<PageContextBar eyebrow="Справочники" title="Отходы" />);

    expect(screen.getByText("Справочники")).toBeInTheDocument();
  });

  it("renders a node eyebrow as-is", () => {
    render(
      <PageContextBar
        eyebrow={<nav aria-label="Путь">Корень / Цех</nav>}
        title="Журнал"
      />,
    );

    expect(screen.getByRole("navigation", { name: "Путь" })).toBeInTheDocument();
  });

  it("is sticky by default and can be turned off for lists", () => {
    const { rerender } = render(<PageContextBar title="Форма" />);

    expect(screen.getByRole("heading", { name: "Форма" })).toHaveClass(
      "truncate",
    );
    expect(
      screen.getByRole("heading", { name: "Форма" }).parentElement
        ?.parentElement,
    ).toHaveClass("sticky");

    rerender(<PageContextBar title="Список" sticky={false} />);

    expect(screen.getByRole("heading", { name: "Список" })).not.toHaveClass(
      "truncate",
    );
    expect(
      screen.getByRole("heading", { name: "Список" }).parentElement
        ?.parentElement,
    ).not.toHaveClass("sticky");
  });
});
