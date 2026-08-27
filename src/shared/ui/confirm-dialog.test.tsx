import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";

afterEach(cleanup);

describe("ConfirmDialog", () => {
  it("does not render the dialog when closed", () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={vi.fn()}
        description="Запись будет удалена."
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("confirms and closes", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        description="Запись будет удалена."
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Удалить запись?" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("cancels without confirming", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Отвязать отход?"
        description="Привязка будет снята."
        confirmLabel="Отвязать"
        cancelLabel="Закрыть"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("can disable the confirm action", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={vi.fn()}
        description="Подождите."
        confirmDisabled
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Удалить" })).toBeDisabled();
  });
});
