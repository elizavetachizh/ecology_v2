import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DataTableEmpty } from "./DataTableEmpty";

afterEach(cleanup);

describe("DataTableEmpty", () => {
  it("renders the default copy in a spanning cell", () => {
    render(
      <table>
        <tbody>
          <DataTableEmpty colSpan={3} />
        </tbody>
      </table>,
    );

    expect(screen.getByText("Нет данных")).toBeInTheDocument();
    expect(
      screen.getByText("По выбранным условиям записи не найдены."),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell")).toHaveAttribute("colspan", "3");
  });
});
