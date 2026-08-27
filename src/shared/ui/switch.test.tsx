import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

afterEach(cleanup);

describe("Switch", () => {
  it("toggles and reports the next checked state", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch aria-label="Только активные" onCheckedChange={onCheckedChange} />,
    );

    const control = screen.getByRole("switch", { name: "Только активные" });
    expect(control).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        aria-label="Только активные"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );

    fireEvent.click(screen.getByRole("switch", { name: "Только активные" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
