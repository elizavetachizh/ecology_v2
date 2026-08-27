import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "./select";

afterEach(cleanup);

describe("Select", () => {
  it("forwards a change from the native control", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Тип" defaultValue="formed" onChange={onChange}>
        <option value="formed">Образование</option>
        <option value="transfer">Передача</option>
      </Select>,
    );

    fireEvent.change(screen.getByLabelText("Тип"), {
      target: { value: "transfer" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Тип")).toHaveValue("transfer");
  });
});
