import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTableRowAction, DataTableRowActions } from "./DataTableRowActions";

afterEach(cleanup);

function openRowActions() {
  const trigger = screen.getByRole("button", { name: "Действия со строкой" });
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
}

describe("DataTableRowActions", () => {
  it("opens the menu and selects an action", () => {
    const onEdit = vi.fn();
    render(
      <DataTableRowActions>
        <DataTableRowAction label="Изменить" onSelect={onEdit} />
      </DataTableRowActions>,
    );

    openRowActions();
    fireEvent.click(screen.getByRole("menuitem", { name: "Изменить" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("does not bubble the trigger click to the row", () => {
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <DataTableRowActions>
          <DataTableRowAction label="Изменить" />
        </DataTableRowActions>
      </div>,
    );

    openRowActions();
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
