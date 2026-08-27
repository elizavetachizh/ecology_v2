import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeInstruction } from "../../../../entities/waste/instructions/model/instruction.fixture";
import { OperationInstructionPicker } from "./OperationInstructionPicker";

afterEach(cleanup);

const instructions = [
  makeInstruction({ id: "ins-1", name: "Первая", short_name: "И-1" }),
  makeInstruction({
    id: "ins-2",
    name: "Вторая",
    short_name: "И-2",
    status: "draft",
  }),
];

describe("OperationInstructionPicker", () => {
  it("shows the list until a value is selected", () => {
    const { rerender } = render(
      <OperationInstructionPicker
        unitId="unit-1"
        instructions={instructions}
        loading={false}
        error={null}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("radiogroup", { name: "Инструкция" }),
    ).toBeInTheDocument();

    rerender(
      <OperationInstructionPicker
        unitId="unit-1"
        instructions={instructions}
        loading={false}
        error={null}
        value="ins-1"
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("radiogroup", { name: "Инструкция" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("И-1")).toBeInTheDocument();
  });

  it("expands on «Другая» and notifies after a pick", () => {
    const onChange = vi.fn();

    render(
      <OperationInstructionPicker
        unitId="unit-1"
        instructions={instructions}
        loading={false}
        error={null}
        value="ins-1"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Другая/ }));
    expect(
      screen.getByRole("radiogroup", { name: "Инструкция" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /И-2/ }));
    expect(onChange).toHaveBeenCalledWith("ins-2");
  });
});
