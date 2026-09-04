import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Waste } from "../../../../entities/waste/wastes";
import { WasteCatalogForm } from "./WasteCatalogForm";

const { hookState } = vi.hoisted(() => ({
  hookState: {
    pending: false,
    error: null as string | null,
    onSubmit: vi.fn(),
  },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...rest }: { children: ReactNode }) => (
    <a {...rest}>{children}</a>
  ),
}));

vi.mock("../../select-waste-classifier", () => ({
  WasteClassifierSelect: ({
    value,
    selectedLabel,
  }: {
    value: string;
    selectedLabel?: string;
  }) => <span>{selectedLabel ?? (value ? `id ${value}` : "Не выбран")}</span>,
}));

vi.mock("../model/use-upsert-waste-form", async () => {
  const { useForm } = await import("react-hook-form");
  const { wasteFormDefaultValues } =
    await import("../model/waste-form.schema");
  return {
    useUpsertWasteForm: ({ initial }: { initial?: Waste | null }) => {
      const form = useForm({
        defaultValues: initial
          ? {
              waste_classifier_id: initial.waste_classifier_id,
              hazard_class: initial.hazard_class,
              uom: initial.uom,
              physical_state: initial.physical_state,
            }
          : wasteFormDefaultValues,
      });
      return {
        form,
        error: hookState.error,
        pending: hookState.pending,
        onSubmit: hookState.onSubmit,
      };
    },
  };
});

const waste: Waste = {
  id: "waste-1",
  tenant_id: "tenant-1",
  waste_classifier_id: 1,
  waste_classifier: { id: 1, code: 111000000000, name: "Опилки" },
  hazard_class: "class_4",
  uom: "ton",
  physical_state: "solid",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  created_by: {
    id: "user-1",
    username: "test",
    email: null,
    first_name: null,
    last_name: null,
  },
  updated_by: {
    id: "user-1",
    username: "test",
    email: null,
    first_name: null,
    last_name: null,
  },
};

afterEach(cleanup);

beforeEach(() => {
  hookState.pending = false;
  hookState.error = null;
  hookState.onSubmit.mockReset();
});

describe("WasteCatalogForm", () => {
  it("shows create copy and default fields", () => {
    render(
      <WasteCatalogForm mode="create" onSaved={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(
      screen.getByRole("heading", { name: "Новый отход" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Создать отход" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Класс опасности")).toHaveValue(
      "unclassified",
    );
    expect(screen.getByLabelText("Единица измерения")).toHaveValue("kg");
    expect(screen.getByLabelText("Агрегатное состояние")).toHaveValue("solid");
  });

  it("shows the classifier name and hydrates fields on edit", () => {
    render(
      <WasteCatalogForm
        mode="edit"
        wasteId="waste-1"
        initial={waste}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Опилки" })).toBeInTheDocument();
    expect(screen.getByText("111000000000 — Опилки")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сохранить" })).toBeInTheDocument();
    expect(screen.getByLabelText("Класс опасности")).toHaveValue("class_4");
    expect(screen.getByLabelText("Единица измерения")).toHaveValue("ton");
  });

  it("calls onCancel from close", () => {
    const onCancel = vi.fn();
    render(
      <WasteCatalogForm mode="create" onSaved={vi.fn()} onCancel={onCancel} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows an API error", () => {
    hookState.error = "Отход уже есть в справочнике";
    render(
      <WasteCatalogForm mode="create" onSaved={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(
      screen.getByText("Отход уже есть в справочнике"),
    ).toBeInTheDocument();
  });

  it("disables actions while pending", () => {
    hookState.pending = true;
    render(
      <WasteCatalogForm mode="create" onSaved={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Сохранение…" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Сохранить и закрыть" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeDisabled();
  });
});
