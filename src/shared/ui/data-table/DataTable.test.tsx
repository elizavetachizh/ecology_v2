import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "./types";
import { DataTable } from "./DataTable";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableExpandCell } from "./DataTableExpandCell";

afterEach(cleanup);

type Row = {
  id: string;
  name: string;
  children?: Row[];
};

const rows: Row[] = [
  { id: "2", name: "Бета" },
  { id: "1", name: "Альфа" },
];

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Название" />
    ),
    cell: ({ row }) => row.original.name,
  },
];

describe("DataTable", () => {
  it("shows the loading state", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(row) => row.id}
        isLoading
      />,
    );

    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("shows the empty state", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(row) => row.id}
        emptyTitle="Нет отходов"
        emptyDescription="Измените фильтр."
      />,
    );

    expect(screen.getByText("Нет отходов")).toBeInTheDocument();
    expect(screen.getByText("Измените фильтр.")).toBeInTheDocument();
  });

  it("renders rows and notifies on row click", () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />,
    );

    fireEvent.click(screen.getByText("Альфа"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0][0].id).toBe("1");
  });

  it("reports sorting without reordering when manualSorting is on", () => {
    const onSortingChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        sorting={[]}
        onSortingChange={onSortingChange}
        manualSorting
      />,
    );

    const names = screen.getAllByRole("cell").map((cell) => cell.textContent);
    expect(names).toEqual(["Бета", "Альфа"]);

    fireEvent.click(screen.getByRole("button", { name: /Название/ }));
    expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", desc: false }]);
  });

  it("sorts rows on the client when manualSorting is off", () => {
    render(
      <DataTable columns={columns} data={rows} getRowId={(row) => row.id} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Название/ }));
    expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual(
      ["Альфа", "Бета"],
    );
  });

  it("renders a non-sortable header as plain text", () => {
    const plainColumns: ColumnDef<Row>[] = [
      {
        accessorKey: "name",
        enableSorting: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Название" />
        ),
      },
    ];

    render(
      <DataTable
        columns={plainColumns}
        data={rows}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText("Название")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Название/ }),
    ).not.toBeInTheDocument();
  });

  it("expands and collapses tree rows", () => {
    const tree: Row[] = [
      {
        id: "p",
        name: "Цех",
        children: [{ id: "c", name: "Участок" }],
      },
    ];
    const treeColumns: ColumnDef<Row>[] = [
      {
        accessorKey: "name",
        header: "Название",
        cell: ({ row }) => (
          <DataTableExpandCell row={row}>
            {row.original.name}
          </DataTableExpandCell>
        ),
      },
    ];

    render(
      <DataTable
        columns={treeColumns}
        data={tree}
        getRowId={(row) => row.id}
        getSubRows={(row) => row.children}
      />,
    );

    expect(screen.queryByText("Участок")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Развернуть" }));
    expect(screen.getByText("Участок")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Свернуть" }));
    expect(screen.queryByText("Участок")).not.toBeInTheDocument();
  });
});
