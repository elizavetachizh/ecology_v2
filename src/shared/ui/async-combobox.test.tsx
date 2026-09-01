import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AsyncCombobox, type AsyncComboboxProps } from "./async-combobox";

afterEach(cleanup);

const options = [
  { value: "a", label: "Альфа" },
  { value: "b", label: "Бета" },
  { value: "c", label: "Гамма", disabled: true },
];

function Harness({
  initialValue = "",
  onValueChange,
  ...props
}: Partial<AsyncComboboxProps> & {
  initialValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [search, setSearch] = useState(props.search ?? "");
  const [value, setValue] = useState(initialValue);
  return (
    <AsyncCombobox
      options={options}
      placeholder="Выберите отход"
      searchPlaceholder="Поиск…"
      emptyMessage="Ничего не найдено"
      aria-label="Отход"
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

describe("AsyncCombobox", () => {
  it("selects an option and shows it on the trigger", () => {
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Отход" }));
    fireEvent.click(screen.getByRole("option", { name: "Бета" }));

    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("combobox", { name: "Отход" })).toHaveTextContent(
      "Бета",
    );
  });

  it("does not select a disabled option", () => {
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Отход" }));
    fireEvent.click(screen.getByRole("option", { name: "Гамма" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clears the selection", () => {
    const onValueChange = vi.fn();
    render(<Harness initialValue="a" onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Отход" }));
    fireEvent.click(screen.getByRole("button", { name: "Очистить выбор" }));

    expect(onValueChange).toHaveBeenCalledWith("");
    expect(screen.getByRole("combobox", { name: "Отход" })).toHaveTextContent(
      "Выберите отход",
    );
  });

  it("shows the empty message and forwards search", () => {
    const setSearch = vi.fn();
    render(
      <Harness options={[]} search="xyz" setSearch={setSearch} />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Отход" }));
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Поиск…"), {
      target: { value: "фанера" },
    });
    expect(setSearch).toHaveBeenCalledWith("фанера");
  });

  it("keeps the selectedLabel when the option is not in the list", () => {
    render(
      <Harness
        options={[]}
        initialValue="missing"
        selectedLabel="Обрезки фанеры"
      />,
    );

    expect(screen.getByRole("combobox", { name: "Отход" })).toHaveTextContent(
      "Обрезки фанеры",
    );
  });

  it("hides the refresh button without onRefresh", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("combobox", { name: "Отход" }));

    expect(
      screen.queryByRole("button", { name: "Обновить список" }),
    ).not.toBeInTheDocument();
  });

  it("calls onRefresh from the refresh button", () => {
    const onRefresh = vi.fn();
    render(<Harness onRefresh={onRefresh} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Отход" }));
    fireEvent.click(screen.getByRole("button", { name: "Обновить список" }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("disables the refresh button while refreshing", () => {
    render(<Harness onRefresh={vi.fn()} refreshing />);

    fireEvent.click(screen.getByRole("combobox", { name: "Отход" }));

    expect(
      screen.getByRole("button", { name: "Обновить список" }),
    ).toBeDisabled();
  });
});
