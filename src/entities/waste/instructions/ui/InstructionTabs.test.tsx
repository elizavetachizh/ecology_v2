import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeInstruction } from "../model/instruction.fixture";
import { InstructionTabs } from "./InstructionTabs";

describe("InstructionTabs", () => {
  it("renders tabs and notifies on change", () => {
    const onValueChange = vi.fn();
    const instructions = [
      makeInstruction({ id: "ins-1", name: "Первая", short_name: null }),
      makeInstruction({
        id: "ins-2",
        name: "Вторая",
        short_name: null,
        status: "draft",
      }),
    ];

    render(
      <InstructionTabs
        instructions={instructions}
        value="ins-1"
        onValueChange={onValueChange}
      />,
    );

    expect(
      screen.getByRole("tablist", { name: "Инструкции" }),
    ).toBeInTheDocument();

    // Radix Tabs switches on mouseDown (button 0), not click.
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Вторая/ }), {
      button: 0,
    });
    expect(onValueChange).toHaveBeenCalledWith("ins-2");
  });
});
