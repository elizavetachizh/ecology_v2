import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InstructionScopedBindingsSection } from "./instruction-scoped-bindings-section";

afterEach(cleanup);

describe("InstructionScopedBindingsSection", () => {
  it("renders chrome, slots and the bind action", () => {
    const onBind = vi.fn();
    render(
      <InstructionScopedBindingsSection
        title="Отходы места учёта"
        description="Привязки к инструкции"
        bindLabel="Привязать отход"
        onBind={onBind}
        instructionsSlot={<div>Инструкции</div>}
        selectHint={<p>Выберите инструкцию</p>}
        content={<p>Список привязок</p>}
        modal={<p>Модалка</p>}
        confirm={<p>Подтверждение</p>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Отходы места учёта" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Привязки к инструкции")).toBeInTheDocument();
    expect(screen.getByText("Инструкции")).toBeInTheDocument();
    expect(screen.getByText("Выберите инструкцию")).toBeInTheDocument();
    expect(screen.getByText("Список привязок")).toBeInTheDocument();
    expect(screen.getByText("Модалка")).toBeInTheDocument();
    expect(screen.getByText("Подтверждение")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Привязать отход/ }));
    expect(onBind).toHaveBeenCalledTimes(1);
  });

  it("disables bind when requested", () => {
    render(
      <InstructionScopedBindingsSection
        title="Отходы"
        description="Привязки"
        bindLabel="Привязать"
        bindDisabled
        onBind={vi.fn()}
        instructionsSlot={null}
        content={null}
      />,
    );

    expect(screen.getByRole("button", { name: /Привязать/ })).toBeDisabled();
  });
});
