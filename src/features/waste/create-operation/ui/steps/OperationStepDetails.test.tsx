import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { operationFixture } from "../../../../../entities/waste/operations/model/operation.fixture";
import type { UnitInstructionWaste } from "../../../../../entities/waste/unit-instruction-waste";
import { useUnitInstructionWastesListQuery } from "../../../../../entities/waste/unit-instruction-waste";
import { useUnitsTreeQuery } from "../../../../../entities/waste/units";
import type { UnitTree } from "../../../../../entities/waste/units";
import {
  createEmptyOperationFormValues,
  type OperationFormValues,
} from "../../model/operation-form.schema";
import { OperationStepDetails } from "./OperationStepDetails";

vi.mock("../../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../../entities/waste/units", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../../entities/waste/units")
    >();
  return {
    ...actual,
    useUnitsTreeQuery: vi.fn(),
  };
});

vi.mock(
  "../../../../../entities/waste/unit-instruction-waste",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../../entities/waste/unit-instruction-waste")
      >();
    return {
      ...actual,
      useUnitInstructionWastesListQuery: vi.fn(),
    };
  },
);

vi.mock("../../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    useCurrentBalanceQuery: () => ({
      balance: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

const useUnitsTreeQueryMock = vi.mocked(useUnitsTreeQuery);
const useUiwListQueryMock = vi.mocked(useUnitInstructionWastesListQuery);

const profile = {
  id: "u",
  username: "u",
  email: null,
  first_name: null,
  last_name: null,
};

const binding: UnitInstructionWaste = {
  id: "uiw-1",
  tenant_id: "tenant-1",
  unit_id: operationFixture.unit_id,
  unit: operationFixture.unit,
  instruction_id: "ins-1",
  instruction: {
    id: "ins-1",
    name: "Инструкция",
    short_name: "И1",
    start_date: "2026-01-01",
    end_date: null,
    status: "active",
  },
  waste_id: operationFixture.waste_id,
  waste: operationFixture.waste,
  waste_source_ids: [],
  waste_sources: [],
  transport_unit: "0",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

function treeNode(
  id: string,
  name: string,
  isPod9: boolean,
  children: UnitTree[] = [],
  parentId: string | null = null,
): UnitTree {
  return {
    id,
    tenant_id: "tenant-1",
    name,
    short_name: null,
    parent_id: parentId,
    is_pod9: isPod9,
    region: null,
    district: null,
    created_at: "",
    updated_at: "",
    created_by: profile,
    updated_by: profile,
    children,
  };
}

function renderStep() {
  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm<OperationFormValues>({
      defaultValues: {
        ...createEmptyOperationFormValues(),
        unit_id: "unit-1",
        instruction_id: "ins-1",
        waste_id: "waste-1",
      },
    });
    return <FormProvider {...form}>{children}</FormProvider>;
  }

  return render(<OperationStepDetails pending={false} />, {
    wrapper: Wrapper,
  });
}

afterEach(cleanup);

beforeEach(() => {
  useUnitsTreeQueryMock.mockReturnValue({
    tree: [],
    loading: false,
    fetching: false,
    error: null,
    refetch: vi.fn(),
  });
  useUiwListQueryMock.mockReturnValue({
    items: [binding],
    total: 1,
    limit: 50,
    offset: 0,
    loading: false,
    fetching: false,
    error: null,
    refetch: vi.fn(),
  });
});

describe("OperationStepDetails", () => {
  it("shows the selected unit and waste from previous steps", () => {
    renderStep();

    expect(screen.getByText("Место учёта")).toBeInTheDocument();
    expect(screen.getByText("Цех №1 (Ц1)")).toBeInTheDocument();
    expect(screen.getByText("Отход")).toBeInTheDocument();
    expect(
      screen.getByText("12345678901 — Отход тестовый"),
    ).toBeInTheDocument();
    expect(screen.getByText("4 класс опасности · кг")).toBeInTheDocument();
    expect(useUiwListQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: expect.objectContaining({ instructionId: "ins-1" }),
      }),
    );
  });

  it("prefers the unit path from the tree over the brief name", () => {
    useUnitsTreeQueryMock.mockReturnValue({
      tree: [
        treeNode("org-1", "Организация", false, [
          treeNode("unit-1", "Цех №1", true, [], "org-1"),
        ]),
      ],
      loading: false,
      fetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderStep();

    expect(screen.getByText("Организация -> Цех №1")).toBeInTheDocument();
    expect(screen.queryByText("Цех №1 (Ц1)")).not.toBeInTheDocument();
  });
});
