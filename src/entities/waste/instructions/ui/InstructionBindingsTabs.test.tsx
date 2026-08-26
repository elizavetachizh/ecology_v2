import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeInstruction } from "../model/instruction.fixture";
import { InstructionBindingsTabs } from "./InstructionBindingsTabs";

describe("InstructionBindingsTabs", () => {
  it("shows loading copy", () => {
    render(
      <InstructionBindingsTabs
        loading
        error={null}
        instructions={[]}
        value=""
        onValueChange={vi.fn()}
        emptyDescription="Пусто"
      />,
    );

    expect(screen.getByText("Загрузка инструкций…")).toBeInTheDocument();
  });

  it("shows error instead of empty catalog", () => {
    render(
      <InstructionBindingsTabs
        loading={false}
        error={new Error("сеть")}
        instructions={[]}
        value=""
        onValueChange={vi.fn()}
        emptyDescription="Пусто"
      />,
    );

    expect(
      screen.getByText("Не удалось загрузить инструкции"),
    ).toBeInTheDocument();
    expect(screen.getByText("сеть")).toBeInTheDocument();
    expect(screen.queryByText("Нет инструкций")).not.toBeInTheDocument();
  });

  it("shows empty description when there are no instructions", () => {
    render(
      <InstructionBindingsTabs
        loading={false}
        error={null}
        instructions={[]}
        value=""
        onValueChange={vi.fn()}
        emptyDescription="Вернитесь к привязке отходов."
      />,
    );

    expect(screen.getByText("Нет инструкций")).toBeInTheDocument();
    expect(
      screen.getByText("Вернитесь к привязке отходов."),
    ).toBeInTheDocument();
  });

  it("renders tabs when the list is ready", () => {
    render(
      <InstructionBindingsTabs
        loading={false}
        error={null}
        instructions={[
          makeInstruction({ id: "ins-1", name: "Первая", short_name: null }),
        ]}
        value="ins-1"
        onValueChange={vi.fn()}
        emptyDescription="Пусто"
      />,
    );

    expect(
      screen.getByRole("tablist", { name: "Инструкции" }),
    ).toBeInTheDocument();
  });
});
