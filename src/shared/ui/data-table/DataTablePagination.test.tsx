import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTablePagination } from "./DataTablePagination";

afterEach(cleanup);

describe("DataTablePagination", () => {
  it("shows an empty copy and disables both buttons", () => {
    render(
      <DataTablePagination
        total={0}
        limit={10}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Нет записей")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Назад" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Вперёд" })).toBeDisabled();
  });

  it("pages forward and back", () => {
    const onOffsetChange = vi.fn();
    const { rerender } = render(
      <DataTablePagination
        total={25}
        limit={10}
        offset={0}
        onOffsetChange={onOffsetChange}
      />,
    );

    expect(screen.getByText("Показано 1–10 из 25")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Назад" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Вперёд" }));
    expect(onOffsetChange).toHaveBeenCalledWith(10);

    rerender(
      <DataTablePagination
        total={25}
        limit={10}
        offset={10}
        onOffsetChange={onOffsetChange}
      />,
    );

    expect(screen.getByText("Показано 11–20 из 25")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(onOffsetChange).toHaveBeenCalledWith(0);
  });

  it("disables paging while loading", () => {
    render(
      <DataTablePagination
        total={25}
        limit={10}
        offset={10}
        onOffsetChange={vi.fn()}
        disabled
      />,
    );

    expect(screen.getByRole("button", { name: "Назад" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Вперёд" })).toBeDisabled();
  });
});
