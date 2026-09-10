import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "../../../shared/ui";
import { DirectoryListChrome } from "./DirectoryListChrome";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to?: string }) => (
    <a href={typeof to === "string" ? to : "/"}>{children}</a>
  ),
}));

afterEach(cleanup);

type Row = { id: string; name: string };

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => row.original.name,
  },
];

const header = {
  title: "Отходы",
  description: "Справочник отходов",
  directoryLabel: "Отходы",
  directoryTo: "/directories/wastes",
  createTo: "/directories/wastes/new",
  createLabel: "Создать отход",
};

describe("DirectoryListChrome", () => {
  it("renders header, create CTA, toolbar and table slots", () => {
    render(
      <DirectoryListChrome
        tenantId="tenant-1"
        resourceLabel="отходов"
        errorTitle="Не удалось загрузить отходы"
        header={{
          ...header,
          actions: <button type="button">Журнал</button>,
        }}
        toolbar={<div>Фильтры</div>}
        columns={columns}
        data={[{ id: "1", name: "Альфа" }]}
        emptyTitle="Отходов пока нет"
        emptyDescription="Создайте отход."
        total={1}
        limit={50}
        offset={0}
        onOffsetChange={vi.fn()}
        footer={<div>Диалог удаления</div>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Отходы" })).toBeInTheDocument();
    expect(screen.getByText("Справочник отходов")).toBeInTheDocument();
    expect(screen.getByText("Справочники")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Создать отход" })).toHaveAttribute(
      "href",
      "/directories/wastes/new",
    );
    expect(screen.getByRole("button", { name: "Журнал" })).toBeInTheDocument();
    expect(screen.getByText("Фильтры")).toBeInTheDocument();
    expect(screen.getByText("Альфа")).toBeInTheDocument();
    expect(screen.getByText("Диалог удаления")).toBeInTheDocument();
    expect(screen.getByText("Показано 1–1 из 1")).toBeInTheDocument();
  });

  it("shows a list error instead of the table", () => {
    render(
      <DirectoryListChrome
        tenantId="tenant-1"
        resourceLabel="отходов"
        error={new Error("сеть недоступна")}
        errorTitle="Не удалось загрузить отходы"
        header={header}
        toolbar={<div>Фильтры</div>}
        columns={columns}
        data={[]}
        emptyTitle="Отходов пока нет"
        total={0}
        limit={50}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Не удалось загрузить отходы")).toBeInTheDocument();
    expect(screen.getByText("сеть недоступна")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Отходы" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Фильтры")).not.toBeInTheDocument();
  });

  it("gates the list when tenant is missing", () => {
    render(
      <DirectoryListChrome
        tenantId={null}
        resourceLabel="отходов"
        errorTitle="Не удалось загрузить отходы"
        header={header}
        toolbar={<div>Фильтры</div>}
        columns={columns}
        data={[]}
        emptyTitle="Отходов пока нет"
        total={0}
        limit={50}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Выберите организацию")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Чтобы работать со справочником отходов, выберите организацию в верхней панели.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Фильтры")).not.toBeInTheDocument();
    expect(screen.queryByText("Создать отход")).not.toBeInTheDocument();
  });
});
