import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./input";

afterEach(cleanup);

describe("Input", () => {
  it("defaults to a text input and accepts a value", () => {
    render(<Input aria-label="Код" defaultValue="1711704" />);

    const input = screen.getByLabelText("Код");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("1711704");
  });

  it("forwards type and disabled", () => {
    render(<Input aria-label="Дата" type="date" disabled />);

    const input = screen.getByLabelText("Дата");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toBeDisabled();
  });
});
