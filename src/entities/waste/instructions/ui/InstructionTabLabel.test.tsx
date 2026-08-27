import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeInstruction } from "../model/instruction.fixture";
import { InstructionTabLabel } from "./InstructionTabLabel";

describe("InstructionTabLabel", () => {
  it("shows short_name and status tooltip", () => {
    const { container } = render(
      <InstructionTabLabel
        instruction={makeInstruction({
          name: "Инструкция по утилизации",
          short_name: "ИООС-1",
          status: "active",
        })}
      />,
    );

    expect(screen.getByText("ИООС-1")).toBeInTheDocument();
    expect(
      screen.getByText("Действует", { selector: ".sr-only" }),
    ).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("title", "Действует");
  });

  it("falls back to name only when short_name is missing", () => {
    render(
      <InstructionTabLabel
        instruction={makeInstruction({
          name: "Без краткого",
          short_name: null,
          status: "draft",
        })}
      />,
    );

    expect(screen.getByText("Без краткого")).toBeInTheDocument();
    expect(
      screen.getByText("Черновик", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });
});
