import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GetUnitsTreeParams, Unit, UnitTree } from "../model/units.types";
import { UnitHierarchicalSelect } from "./UnitHierarchicalSelect";

const useUnitsTreeQueryMock = vi.fn();

vi.mock("../model/use-units-tree-query", () => ({
  useUnitsTreeQuery: (args: unknown) => useUnitsTreeQueryMock(args),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: undefined }),
}));

function stubUnit(
  id: string,
  parentId: string | null,
  name: string,
  isPod9 = false,
): Unit {
  return {
    id,
    tenant_id: "t1",
    name,
    short_name: null,
    parent_id: parentId,
    is_pod9: isPod9,
    region: null,
    district: null,
    created_at: "",
    updated_at: "",
    created_by: {
      id: "u",
      username: "u",
      email: null,
      first_name: null,
      last_name: null,
    },
    updated_by: {
      id: "u",
      username: "u",
      email: null,
      first_name: null,
      last_name: null,
    },
  };
}

function stubTree(
  id: string,
  parentId: string | null,
  name: string,
  children: UnitTree[] = [],
  isPod9 = false,
): UnitTree {
  return { ...stubUnit(id, parentId, name, isPod9), children };
}

const forest: UnitTree[] = [
  stubTree("dept-1", null, "Цех", [
    stubTree("site-1", "dept-1", "Участок", [
      stubTree("journal-1", "site-1", "Журнал", [], true),
    ]),
  ]),
];

function lastTreeParams(): GetUnitsTreeParams {
  return useUnitsTreeQueryMock.mock.lastCall?.[0].params ?? {};
}

function renderSelect(
  props: Partial<Parameters<typeof UnitHierarchicalSelect>[0]> = {},
) {
  useUnitsTreeQueryMock.mockReturnValue({
    tree: forest,
    loading: false,
  });
  const onChange = vi.fn();
  render(
    <UnitHierarchicalSelect
      tenantId="t1"
      value=""
      onChange={onChange}
      {...props}
    />,
  );
  fireEvent.click(
    screen.getByRole("combobox", { name: "Родительская структурная единица" }),
  );
  return { onChange };
}

describe("UnitHierarchicalSelect", () => {
  afterEach(() => {
    cleanup();
    useUnitsTreeQueryMock.mockReset();
  });

  it("shows the full tree and badges POD-9 nodes", () => {
    renderSelect();

    expect(lastTreeParams().is_pod9).toBeUndefined();
    expect(screen.getByRole("option", { name: "Цех" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Участок" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /ЖурналПОД-9/ }),
    ).toBeInTheDocument();
  });

  it("requests and lists only POD-9 units", () => {
    renderSelect({ isPod9: true });

    expect(lastTreeParams().is_pod9).toBe(true);
    expect(
      screen.queryByRole("option", { name: "Цех" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /Цех -> Участок -> ЖурналПОД-9/ }),
    ).toBeInTheDocument();
  });

  it("requests the tree without POD-9 units", () => {
    renderSelect({ isPod9: false });

    expect(lastTreeParams().is_pod9).toBe(false);
    expect(screen.getByRole("option", { name: "Цех" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Участок" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /Журнал/ }),
    ).not.toBeInTheDocument();
  });
});
