import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InstructionStatusBadge } from "./InstructionStatusBadge";

describe("InstructionStatusBadge", () => {
  it.each([
    ["draft", "Черновик"],
    ["active", "Действует"],
    ["inactive", "Не действует"],
  ] as const)("renders label for %s", (status, label) => {
    render(<InstructionStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
