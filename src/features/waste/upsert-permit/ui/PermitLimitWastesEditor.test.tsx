import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { PermitLimitWastesEditor } from "./PermitLimitWastesEditor";
import {
  emptyPermitLimitWasteRow,
  type PermitFormValues,
} from "../model/permit-form.schema";

vi.mock("../../../../entities/waste/wastes", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/waste/wastes")>();
  return {
    ...actual,
    useWastesOptions: () => ({
      options: [],
      loading: false,
      refreshing: false,
      error: undefined,
      search: "",
      setSearch: vi.fn(),
      refetch: vi.fn(),
    }),
  };
});

const sawdust = {
  waste_id: "waste-sawdust",
  amount: "1",
  label: "111000000000 — Опилки",
  uomLabel: "т",
};
const slag = {
  waste_id: "waste-slag",
  amount: "2",
  label: "222000000000 — Шлак",
  uomLabel: "т",
};

function Editor() {
  const form = useForm<PermitFormValues>({
    defaultValues: {
      number: "",
      start_date: "2026-01-15",
      end_date: "",
      unit_id: "",
      burial_wastes: [sawdust, slag, { ...emptyPermitLimitWasteRow }],
      storage_wastes: [{ ...emptyPermitLimitWasteRow }],
    },
  });

  return (
    <PermitLimitWastesEditor
      form={form}
      tenantId="tenant-1"
      pending={false}
      name="burial_wastes"
    />
  );
}

function searchField() {
  return screen.getByRole("textbox", {
    name: "Поиск среди отходов на захоронение",
  });
}

function wasteRow(label: string) {
  const row = screen.getByText(label).closest("tr");
  if (!row) throw new Error(`Строка «${label}» не найдена`);
  return row;
}

afterEach(cleanup);

describe("PermitLimitWastesEditor search", () => {
  it("filters added wastes by name or code and keeps the draft row", () => {
    render(<Editor />);

    expect(screen.getByText(sawdust.label)).toBeInTheDocument();
    expect(screen.getByText(slag.label)).toBeInTheDocument();

    fireEvent.change(searchField(), { target: { value: "опил" } });
    expect(wasteRow(sawdust.label)).not.toHaveAttribute("hidden");
    expect(wasteRow(slag.label)).toHaveAttribute("hidden");
    expect(
      screen.getByRole("combobox", { name: "Отход для лимита захоронения" }),
    ).toBeInTheDocument();

    fireEvent.change(searchField(), { target: { value: "222" } });
    expect(wasteRow(sawdust.label)).toHaveAttribute("hidden");
    expect(wasteRow(slag.label)).not.toHaveAttribute("hidden");

    fireEvent.change(searchField(), { target: { value: "нет такого" } });
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
    expect(wasteRow(sawdust.label)).toHaveAttribute("hidden");
    expect(wasteRow(slag.label)).toHaveAttribute("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Очистить поиск" }));
    expect(wasteRow(sawdust.label)).not.toHaveAttribute("hidden");
    expect(wasteRow(slag.label)).not.toHaveAttribute("hidden");
  });

  it("keeps a hidden row amount when the filter changes", () => {
    render(<Editor />);

    const amount = screen.getByRole("textbox", {
      name: `Лимит на захоронение, ${sawdust.label}`,
    });
    fireEvent.change(amount, { target: { value: "9.5" } });
    fireEvent.change(searchField(), { target: { value: "шлак" } });
    fireEvent.click(screen.getByRole("button", { name: "Очистить поиск" }));

    expect(
      screen.getByRole("textbox", {
        name: `Лимит на захоронение, ${sawdust.label}`,
      }),
    ).toHaveValue("9.5");
  });
});
