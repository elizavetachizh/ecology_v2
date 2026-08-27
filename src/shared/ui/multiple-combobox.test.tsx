import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MultipleCombobox,
  type MultipleComboboxProps,
} from "./multiple-combobox";

afterEach(cleanup);

const options = [
  { value: "a", label: "Альфа" },
  { value: "b", label: "Бета" },
  { value: "c", label: "Гамма" },
];

function Harness({
  initialValue = [],
  onValueChange,
  ...props
}: Partial<MultipleComboboxProps> & {
  initialValue?: string[];
  onValueChange?: (value: string[]) => void;
}) {
  const [search, setSearch] = useState(props.search ?? "");
  const [value, setValue] = useState(initialValue);
  return (
    <MultipleCombobox
      options={options}
      placeholder="Выберите источники"
      searchPlaceholder="Поиск…"
      emptyMessage="Источники не найдены"
      aria-label="Источники"
      maxVisibleValues={1}
      {...props}
      search={search}
      setSearch={(next) => {
        setSearch(next);
        props.setSearch?.(next);
      }}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
    />
  );
}

describe("MultipleCombobox", () => {
  it("toggles options and keeps the popover open", () => {
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Источники" }));
    fireEvent.click(screen.getByRole("option", { name: "Альфа" }));
    fireEvent.click(screen.getByRole("option", { name: "Бета" }));

    expect(onValueChange).toHaveBeenNthCalledWith(1, ["a"]);
    expect(onValueChange).toHaveBeenNthCalledWith(2, ["a", "b"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Источники" })).toHaveTextContent(
      "+1",
    );
  });

  it("removes an already selected option", () => {
    const onValueChange = vi.fn();
    render(
      <Harness initialValue={["a", "b"]} onValueChange={onValueChange} />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Источники" }));
    fireEvent.click(screen.getByRole("option", { name: "Альфа" }));

    expect(onValueChange).toHaveBeenCalledWith(["b"]);
  });

  it("clears all selected values", () => {
    const onValueChange = vi.fn();
    render(<Harness initialValue={["a"]} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Источники" }));
    fireEvent.click(screen.getByRole("button", { name: "Очистить выбор" }));

    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("shows the empty message", () => {
    render(<Harness options={[]} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Источники" }));
    expect(screen.getByText("Источники не найдены")).toBeInTheDocument();
  });
});
