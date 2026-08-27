import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ListSearchField } from "./list-search-field";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ListSearchField", () => {
  it("commits a trimmed value after debounce", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<ListSearchField onSearch={onSearch} debounceMs={400} />);

    fireEvent.change(screen.getByLabelText("Поиск"), {
      target: { value: "  фанера  " },
    });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("фанера");
  });

  it("commits immediately on Enter", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<ListSearchField onSearch={onSearch} debounceMs={400} />);

    const input = screen.getByLabelText("Поиск");
    fireEvent.change(input, { target: { value: "песок" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("песок");
  });

  it("does not commit the same trimmed value", () => {
    const onSearch = vi.fn();
    render(<ListSearchField value="песок" onSearch={onSearch} />);

    fireEvent.keyDown(screen.getByLabelText("Поиск"), { key: "Enter" });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("syncs the draft when the committed value changes from outside", () => {
    const { rerender } = render(
      <ListSearchField value="старое" onSearch={vi.fn()} />,
    );

    expect(screen.getByLabelText("Поиск")).toHaveValue("старое");

    rerender(<ListSearchField value="" onSearch={vi.fn()} />);
    expect(screen.getByLabelText("Поиск")).toHaveValue("");
  });
});
