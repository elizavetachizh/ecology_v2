import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateFilterInput } from "./date-filter-input";

afterEach(cleanup);

describe("DateFilterInput", () => {
  it("does not commit an incomplete or empty change", () => {
    const onValueChange = vi.fn();
    render(
      <DateFilterInput aria-label="Дата с" onValueChange={onValueChange} />,
    );

    fireEvent.change(screen.getByLabelText("Дата с"), {
      target: { value: "" },
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("commits a complete ISO date immediately", () => {
    const onValueChange = vi.fn();
    render(
      <DateFilterInput aria-label="Дата с" onValueChange={onValueChange} />,
    );

    fireEvent.change(screen.getByLabelText("Дата с"), {
      target: { value: "2026-03-01" },
    });

    expect(onValueChange).toHaveBeenCalledWith("2026-03-01");
  });

  it("commits a clear on blur", () => {
    const onValueChange = vi.fn();
    render(
      <DateFilterInput
        aria-label="Дата с"
        value="2026-03-01"
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByLabelText("Дата с");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });
});
