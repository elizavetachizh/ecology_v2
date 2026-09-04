import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Tenant } from "../model/tenant.types";
import { TenantSelect } from "./TenantSelect";

const child: Tenant = {
  id: "child",
  realm: "mingas",
  name: "Филиал Старобинский",
  short: "ТБЗ Старобинский",
  parent_id: "parent",
  children: [],
};

const parent: Tenant = {
  id: "parent",
  realm: "mingas",
  name: 'УП "Мингаз"',
  short: 'УП "Мингаз"',
  parent_id: null,
  children: [child],
};

describe("TenantSelect", () => {
  afterEach(cleanup);
  it("renders tenants as a tree with levels and selects a child", () => {
    const onValueChange = vi.fn();
    render(
      <TenantSelect
        tenants={[parent]}
        value="parent"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("combobox", { name: "Активная организация" }),
    );

    const parentItem = screen.getByRole("treeitem", { name: /УП "Мингаз"/ });
    const childItem = screen.getByRole("treeitem", {
      name: /ТБЗ Старобинский/,
    });

    expect(parentItem).toHaveAttribute("aria-level", "1");
    expect(childItem).toHaveAttribute("aria-level", "2");
    expect(parentItem).toHaveAttribute("aria-selected", "true");

    fireEvent.click(childItem);
    expect(onValueChange).toHaveBeenCalledWith("child");
  });

  it("disables the combobox when the tenant list is empty", () => {
    render(<TenantSelect tenants={[]} value={null} onValueChange={vi.fn()} />);

    const trigger = screen.getByRole("combobox", {
      name: "Активная организация",
    });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveTextContent("Нет доступных организаций");
  });

  it("filters the tree by search and keeps the parent of a match", () => {
    render(
      <TenantSelect tenants={[parent]} value={null} onValueChange={vi.fn()} />,
    );

    fireEvent.click(
      screen.getByRole("combobox", { name: "Активная организация" }),
    );
    fireEvent.change(screen.getByLabelText("Поиск организации"), {
      target: { value: "старобин" },
    });

    expect(
      screen.getByRole("treeitem", { name: /ТБЗ Старобинский/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("treeitem", { name: /УП "Мингаз"/ }),
    ).toBeInTheDocument();
  });
});
