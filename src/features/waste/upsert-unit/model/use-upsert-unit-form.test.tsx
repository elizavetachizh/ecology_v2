import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  updateUnit,
  unitsQueryKeys,
  type Unit,
} from "../../../../entities/waste/units";
import { queryClient } from "../../../../shared/lib/query-client";
import { useUpsertUnitForm } from "./use-upsert-unit-form";
import type { UnitFormValues } from "./unit-form.schema";

vi.mock("../../../../entities/waste/units", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/waste/units")>();
  return {
    ...actual,
    createUnit: vi.fn(),
    updateUnit: vi.fn(),
  };
});

const updateMock = vi.mocked(updateUnit);

const profile = {
  id: "u1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

const unit: Unit = {
  id: "11111111-1111-1111-1111-111111111111",
  tenant_id: "tenant-1",
  name: "Цех",
  short_name: "Ц",
  parent_id: null,
  is_pod9: false,
  region: null,
  district: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

const updated: Unit = {
  ...unit,
  name: "Цех А",
  updated_at: "2026-09-04T12:00:00Z",
};

const values: UnitFormValues = {
  name: unit.name,
  short_name: unit.short_name ?? "",
  parent_id: "",
  region_id: undefined,
  district_id: undefined,
  is_pod9: false,
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

describe("useUpsertUnitForm", () => {
  beforeEach(() => {
    updateMock.mockReset();
    updateMock.mockResolvedValue(updated);
    queryClient.clear();
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it("writes the patched unit into the detail cache", async () => {
    queryClient.setQueryData(
      unitsQueryKeys.detail(unit.tenant_id, unit.id),
      unit,
    );
    const onSaved = vi.fn();
    const { result } = renderHook(
      () =>
        useUpsertUnitForm({
          mode: "edit",
          unitId: unit.id,
          initial: unit,
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
      queryClient.getQueryData(unitsQueryKeys.detail(unit.tenant_id, unit.id)),
    ).toEqual(updated);
  });
});
