import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInstruction,
  instructionsQueryKeys,
  updateInstruction,
} from "../../../../entities/waste/instructions";
import { makeInstruction } from "../../../../entities/waste/instructions/model/instruction.fixture";
import { queryClient } from "../../../../shared/lib/query-client";
import { useUpsertInstructionForm } from "./use-upsert-instruction-form";
import type { InstructionFormValues } from "./instruction-form.schema";

vi.mock("../../../../entities/waste/instructions", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/instructions")
    >();
  return {
    ...actual,
    createInstruction: vi.fn(),
    updateInstruction: vi.fn(),
  };
});

const createMock = vi.mocked(createInstruction);
const updateMock = vi.mocked(updateInstruction);

const instruction = makeInstruction();
const updated = makeInstruction({
  name: "Обновлённая инструкция",
  updated_at: "2026-09-04T12:00:00Z",
});

const values: InstructionFormValues = {
  name: instruction.name,
  short_name: instruction.short_name ?? "",
  start_date: instruction.start_date ?? "",
  end_date: instruction.end_date ?? "",
  status: instruction.status,
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useUpsertInstructionForm", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateMock.mockReset();
    createMock.mockResolvedValue(instruction);
    updateMock.mockResolvedValue(updated);
    queryClient.clear();
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it("creates an instruction and notifies onSaved", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () => useUpsertInstructionForm({ mode: "create", onSaved }),
      { wrapper },
    );

    await act(() => result.current.onSubmit(false, values));

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(instruction, { close: false }),
    );
    expect(createMock).toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: instructionsQueryKeys.lists(),
    });
  });

  it("writes the patched instruction into the detail cache", async () => {
    queryClient.setQueryData(
      instructionsQueryKeys.detail(instruction.tenant_id, instruction.id),
      instruction,
    );
    const onSaved = vi.fn();
    const { result } = renderHook(
      () =>
        useUpsertInstructionForm({
          mode: "edit",
          instructionId: instruction.id,
          initial: instruction,
          onSaved,
        }),
      { wrapper },
    );

    await act(() =>
      result.current.onSubmit(true, { ...values, name: updated.name }),
    );

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(updated, { close: true }),
    );
    expect(
      queryClient.getQueryData(
        instructionsQueryKeys.detail(instruction.tenant_id, instruction.id),
      ),
    ).toEqual(updated);
  });

  it("surfaces an API error on update", async () => {
    updateMock.mockRejectedValue(new Error("Имя уже занято"));
    const { result } = renderHook(
      () =>
        useUpsertInstructionForm({
          mode: "edit",
          instructionId: instruction.id,
          initial: instruction,
          onSaved: vi.fn(),
        }),
      { wrapper },
    );

    await act(() => result.current.onSubmit(false, values));

    await waitFor(() => expect(result.current.error).toBe("Имя уже занято"));
  });
});
