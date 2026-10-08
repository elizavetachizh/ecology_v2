import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTableRowActions } from "../../../../shared/ui";
import { PrintPassportRowAction } from "./PrintPassportRowAction";

afterEach(cleanup);

function openRowActions() {
  const trigger = screen.getByRole("button", { name: "Действия со строкой" });
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
}

describe("PrintPassportRowAction", () => {
  it("offers one action that opens the passport preview", () => {
    const onSelect = vi.fn();
    render(
      <DataTableRowActions>
        <PrintPassportRowAction onSelect={onSelect} />
      </DataTableRowActions>,
    );

    openRowActions();

    expect(
      screen.getAllByRole("menuitem", { name: "Сформировать паспорт" }),
    ).toHaveLength(1);
    expect(screen.queryByRole("menuitem", { name: "Печать Word" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Печать PDF" })).toBeNull();

    fireEvent.click(
      screen.getByRole("menuitem", { name: "Сформировать паспорт" }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
