import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

afterEach(cleanup);

describe("Table", () => {
  it("renders caption, headers and cells", () => {
    render(
      <Table>
        <TableCaption>Список отходов</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Код</TableHead>
            <TableHead>Название</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1711704</TableCell>
            <TableCell>Обрезки фанеры</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText("Список отходов")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Код" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "1711704" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "Обрезки фанеры" }),
    ).toBeInTheDocument();
  });
});
