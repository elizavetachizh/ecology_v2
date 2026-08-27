import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./button";

afterEach(cleanup);

describe("Button", () => {
  it("renders a button and forwards clicks", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled={false}>
        Сохранить
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Сохранить
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the child instead of a button when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/directories/wastes">К справочнику</a>
      </Button>,
    );

    expect(
      screen.getByRole("link", { name: "К справочнику" }),
    ).toHaveAttribute("href", "/directories/wastes");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
