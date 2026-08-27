import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UnitInstructionWaste } from "../../../../entities/waste/unit-instruction-waste";
import { operationFixture } from "../../../../entities/waste/operations/model/operation.fixture";
import { OperationWastePicker } from "./OperationWastePicker";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
    search,
    ...rest
  }: {
    children: ReactNode;
    to: string;
    params?: { unitId?: string };
    search?: { instructionId?: string; tenant?: string };
  }) => (
    <a
      href={`${to.replace("$unitId", params?.unitId ?? "")}?instructionId=${search?.instructionId ?? ""}&tenant=${search?.tenant ?? ""}`}
      {...rest}
    >
      {children}
    </a>
  ),
}));

afterEach(cleanup);

const item = {
  id: "uiw-1",
  waste_id: operationFixture.waste_id,
  waste: operationFixture.waste,
} as UnitInstructionWaste;

describe("OperationWastePicker", () => {
  it("links to the selected unit card when wastes are listed", () => {
    render(
      <OperationWastePicker
        unitId="unit-1"
        instructionId="ins-1"
        tenantId="tenant-1"
        items={[item]}
        total={1}
        loading={false}
        error={null}
        value=""
        onChange={vi.fn()}
      />,
    );

    const link = screen.getByRole("link", { name: "Открыть место учёта" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("href")).toContain("unit-1");
    expect(link.getAttribute("href")).toContain("instructionId=ins-1");
    expect(link.getAttribute("href")).toContain("tenant=tenant-1");
  });

  it("links to the unit card when no wastes are bound", () => {
    render(
      <OperationWastePicker
        unitId="unit-1"
        instructionId="ins-1"
        tenantId="tenant-1"
        items={[]}
        total={0}
        loading={false}
        error={null}
        value=""
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Нет привязанных отходов")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Открыть место учёта" }),
    ).toBeInTheDocument();
  });
});
