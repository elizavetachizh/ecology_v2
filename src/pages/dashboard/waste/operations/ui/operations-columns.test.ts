import { Fragment, createElement, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeOperation } from "../../../../../entities/waste/operations/model/operation.fixture";
import type { Operation } from "../../../../../entities/waste/operations";
import { operationsColumns } from "./operations-columns";

const actions = {
  onDelete: vi.fn(),
  onApprove: vi.fn(),
  onReject: vi.fn(),
};

describe("operationsColumns", () => {
  it("exposes Operation fields, status and row actions", () => {
    const columns = operationsColumns(actions);
    expect(columns.map((column) => column.id)).toEqual([
      "date",
      "unit",
      "waste",
      "operation_type",
      "status",
      "amount",
      "balance",
      "created_at",
      "actions",
    ]);
    expect(
      columns
        .filter((column) => column.enableSorting !== false)
        .map((column) => column.id),
    ).toEqual(["date", "unit", "waste", "operation_type", "status", "amount"]);
  });
});

afterEach(cleanup);

function renderActions(operation: Operation, lockDate: string | null = null) {
  const columns = operationsColumns({ ...actions, lockDate });
  const column = columns.find((item) => item.id === "actions");
  if (!column || typeof column.cell !== "function") {
    throw new Error("actions column is missing");
  }
  const node = column.cell({
    row: { original: operation },
  } as never) as ReactNode;
  return render(createElement(Fragment, null, node));
}

function openRowActions() {
  const trigger = screen.getByRole("button", { name: "Действия со строкой" });
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
}

describe("operationsColumns period lock", () => {
  it("hides approve, reject and delete when the operation date is closed", () => {
    renderActions(
      makeOperation({
        date: "2026-03-01",
        status: "confirmation_required",
      }),
      "2026-03-01",
    );

    expect(
      screen.queryByRole("button", { name: "Действия со строкой" }),
    ).not.toBeInTheDocument();
  });

  it("keeps review actions when the date is after the lock", () => {
    renderActions(
      makeOperation({
        date: "2026-03-02",
        status: "confirmation_required",
      }),
      "2026-03-01",
    );

    openRowActions();
    expect(
      screen.getByRole("menuitem", { name: "Подтвердить операцию" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Отклонить операцию" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Удалить операцию" }),
    ).toBeInTheDocument();
  });

  it("hides delete for a confirmed row inside the closed period", () => {
    renderActions(
      makeOperation({ date: "2026-02-28", status: "confirmed" }),
      "2026-03-01",
    );

    expect(
      screen.queryByRole("button", { name: "Действия со строкой" }),
    ).not.toBeInTheDocument();
  });
});
