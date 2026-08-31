import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateOperationModal } from "./CreateOperationModal";

const { hookState } = vi.hoisted(() => ({
  hookState: {
    pending: false,
    error: null as string | null,
    clearError: vi.fn(),
  },
}));

vi.mock("./steps/OperationStepUnit", () => ({
  OperationStepUnit: () => null,
}));

vi.mock("../model/use-create-operation-form", async () => {
  const { useForm } = await import("react-hook-form");
  const { createEmptyOperationFormValues } =
    await import("../model/operation-form.schema");
  return {
    useCreateOperationForm: () => {
      const form = useForm({
        defaultValues: createEmptyOperationFormValues(),
      });
      return {
        form,
        error: hookState.error,
        pending: hookState.pending,
        onSubmit: vi.fn(),
        clearError: hookState.clearError,
      };
    },
  };
});

afterEach(cleanup);

beforeEach(() => {
  hookState.pending = false;
  hookState.error = null;
  hookState.clearError.mockClear();
});

describe("CreateOperationModal", () => {
  it("closes from the X button when not saving", () => {
    const onOpenChange = vi.fn();
    render(
      <CreateOperationModal
        open
        onOpenChange={onOpenChange}
        onSaved={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not dismiss while the create request is pending", () => {
    hookState.pending = true;
    const onOpenChange = vi.fn();
    render(
      <CreateOperationModal
        open
        onOpenChange={onOpenChange}
        onSaved={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Закрыть" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeDisabled();

    fireEvent.keyDown(screen.getByRole("dialog"), {
      key: "Escape",
      code: "Escape",
    });
    fireEvent.pointerDown(document.body);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("does not show the API error on an earlier wizard step", () => {
    hookState.error = "Недостаточно остатка";
    render(
      <CreateOperationModal open onOpenChange={vi.fn()} onSaved={vi.fn()} />,
    );

    expect(screen.getByText("Шаг 1 из 4: Дата")).toBeInTheDocument();
    expect(screen.queryByText("Не удалось сохранить")).not.toBeInTheDocument();
    expect(screen.queryByText("Недостаточно остатка")).not.toBeInTheDocument();
  });

  it("clears the API error when the step changes", async () => {
    render(
      <CreateOperationModal open onOpenChange={vi.fn()} onSaved={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Далее" }));

    await waitFor(() =>
      expect(screen.getByText("Шаг 2 из 4: Место учёта")).toBeInTheDocument(),
    );
    expect(hookState.clearError).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Назад" }));

    await waitFor(() =>
      expect(screen.getByText("Шаг 1 из 4: Дата")).toBeInTheDocument(),
    );
    expect(hookState.clearError).toHaveBeenCalledTimes(2);
  });
});
